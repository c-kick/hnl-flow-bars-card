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
});
