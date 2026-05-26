import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';

describe('card css_vars lifecycle', () => {
    it('keeps host css_vars when the card disconnects', async () => {
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

        const card = document.createElement('hnl-flow-bars-card');

        card.setConfig({
            production: [{ entity: 'sensor.solar_power' }],
            consumption: [{ entity: 'sensor.house_power' }],
            css_vars: {
                'destination-bg-opacity': 1,
            },
        });

        expect(card.style.getPropertyValue('--hnl-flow-bars-destination-bg-opacity')).toBe('1');

        card.disconnectedCallback();

        expect(card.style.getPropertyValue('--hnl-flow-bars-destination-bg-opacity')).toBe('1');
        expect(card._rawConfig.css_vars).toEqual({
            '--hnl-flow-bars-destination-bg-opacity': '1',
        });
    });

    it('resolves clip_labels from an entity and refreshes when that entity changes', async () => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig({
            production: [{ entity: 'sensor.solar_power' }],
            consumption: [{ entity: 'sensor.house_power' }],
            clip_labels: { entity: 'input_boolean.clip_labels' },
        });

        const offHass = {
            states: {
                'sensor.solar_power': { entity_id: 'sensor.solar_power', state: '10', attributes: {} },
                'sensor.house_power': { entity_id: 'sensor.house_power', state: '8', attributes: {} },
                'input_boolean.clip_labels': { entity_id: 'input_boolean.clip_labels', state: 'off', attributes: {} },
            },
        };
        const onHass = {
            states: {
                ...offHass.states,
                'input_boolean.clip_labels': { entity_id: 'input_boolean.clip_labels', state: 'on', attributes: {} },
            },
        };

        card.hass = offHass;
        expect(card._parsedConfig.card_class).not.toContain('clip-labels');

        card.hass = onHass;
        card.updated(new Map([['hass', offHass]]));

        expect(card._parsedConfig.card_class).toContain('clip-labels');
    });

    it('does not render any card icons when show_icons is false', async () => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig({
            production: [{ entity: 'sensor.solar_power' }],
            consumption: [{ entity: 'sensor.house_power' }],
            show_icons: false,
        });
        card.hass = {
            states: {
                'sensor.solar_power': { entity_id: 'sensor.solar_power', state: '10', attributes: { icon: 'mdi:solar-power' } },
                'sensor.house_power': { entity_id: 'sensor.house_power', state: '8', attributes: { icon: 'mdi:home-lightning-bolt' } },
            },
        };

        expect(card._rawConfig.show_icons).toBe(false);
        expect(card._parsedConfig.show_icons).toBe(false);

        const rendered = card.render();
        const renderedMarkup = rendered.strings.join('');

        expect(renderedMarkup).not.toContain('<ha-icon');
    });
});
