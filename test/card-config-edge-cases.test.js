import { describe, expect, it, beforeAll } from 'vitest';
import { Window } from 'happy-dom';

const baseConfig = {
    production: [{ entity: 'sensor.solar_power' }],
    consumption: [{ entity: 'sensor.house_power' }],
};

const makeStates = (overrides = {}) => ({
    'sensor.solar_power': { entity_id: 'sensor.solar_power', state: '10', attributes: {} },
    'sensor.house_power': { entity_id: 'sensor.house_power', state: '8', attributes: {} },
    ...overrides,
});

describe('card config edge cases', () => {
    beforeAll(async () => {
        const window = new Window();
        globalThis.window = window;
        globalThis.document = window.document;
        globalThis.customElements = window.customElements;
        globalThis.HTMLElement = window.HTMLElement;
        globalThis.Element = window.Element;
        globalThis.Document = window.Document;
        globalThis.Event = window.Event;
        globalThis.CustomEvent = window.CustomEvent;
        globalThis.ShadowRoot = window.ShadowRoot;
        globalThis.CSSStyleSheet = window.CSSStyleSheet;

        await import('../src/hnl-flow-bars-card.js');
    });

    it('honours bg_opacity: 0 on entities, remainders, and globally', () => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig({
            production: [{ entity: 'sensor.solar_power', bg_opacity: 0 }],
            consumption: [{ entity: 'sensor.house_power' }],
            global_bg_opacity: 0,
            production_remainder: { bg_opacity: 0 },
        });
        card.hass = { states: makeStates() };

        expect(card._parsedConfig.production[0].bg_opacity).toBe(0);
        // unset on the entity → falls back to the global value, not 'inherit'
        expect(card._parsedConfig.consumption[0].bg_opacity).toBe(0);
        expect(card._rawConfig.production_remainder.bg_opacity).toBe(0);
        expect(card._rawConfig.consumption_remainder.bg_opacity).toBe(0);
    });

    it('refreshes the parsed config when only entity attributes change', () => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig(baseConfig);

        const hassV1 = {
            states: makeStates({
                'sensor.solar_power': {
                    entity_id: 'sensor.solar_power',
                    state: '10',
                    attributes: { friendly_name: 'Solar' },
                },
            }),
        };
        const hassV2 = {
            states: makeStates({
                'sensor.solar_power': {
                    entity_id: 'sensor.solar_power',
                    state: '10', // unchanged — only the attribute differs
                    attributes: { friendly_name: 'Solar PV' },
                },
            }),
        };

        card.hass = hassV1;
        expect(card._parsedConfig.production[0].name).toBe('Solar');

        card.hass = hassV2;
        card.updated(new Map([['hass', hassV1]]));
        expect(card._parsedConfig.production[0].name).toBe('Solar PV');
    });

    it('getCardSize returns a number even when grid rows is "auto"', () => {
        const card = document.createElement('hnl-flow-bars-card');

        card.setConfig({ ...baseConfig, grid_options: { rows: 'auto' } });
        expect(card.getCardSize()).toBe(1);

        card.setConfig({ ...baseConfig, grid_options: { rows: 3 } });
        expect(card.getCardSize()).toBe(3);

        card.setConfig(baseConfig);
        expect(card.getCardSize()).toBe(1);
    });
});
