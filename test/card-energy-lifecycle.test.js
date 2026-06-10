import { describe, expect, it, beforeAll } from 'vitest';
import { Window } from 'happy-dom';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function makeCollection() {
    const subscribers = new Set();
    return {
        subscribers,
        subscribe(cb) {
            subscribers.add(cb);
            return () => subscribers.delete(cb);
        },
    };
}

function makeHass(collection, callWS = async () => ({})) {
    return {
        connection: { _energy: collection },
        callWS,
        states: {
            'sensor.solar_power': { entity_id: 'sensor.solar_power', state: '10', attributes: {} },
            'sensor.house_power': { entity_id: 'sensor.house_power', state: '8', attributes: {} },
        },
    };
}

const energyConfig = {
    production: [{ entity: 'sensor.solar_power' }],
    consumption: [{ entity: 'sensor.house_power' }],
    energy_date_selection: true,
};

describe('card energy subscription lifecycle', () => {
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

    it('does not leak subscriptions when setConfig supersedes an in-flight subscribe', async () => {
        const collection = makeCollection();
        const card = document.createElement('hnl-flow-bars-card');
        card.hass = makeHass(collection);

        card.setConfig(energyConfig);
        document.body.appendChild(card);
        // Re-configure while the first subscribe promise is still resolving
        // (the editor does this on every keystroke).
        card.setConfig(energyConfig);
        await flush();

        card.disconnectedCallback();
        await flush();

        expect(collection.subscribers.size).toBe(0);
        document.body.removeChild(card);
    });

    it('does not leak a subscription when the card disconnects during subscribe', async () => {
        const collection = makeCollection();
        const card = document.createElement('hnl-flow-bars-card');
        card.hass = makeHass(collection);

        card.setConfig(energyConfig);
        document.body.appendChild(card);
        // Disconnect before the subscribe promise has handed back the unsub.
        card.disconnectedCallback();
        await flush();

        expect(collection.subscribers.size).toBe(0);
        document.body.removeChild(card);
    });

    it('discards out-of-order statistics responses', async () => {
        const collection = makeCollection();
        const resolvers = [];
        const statsFor = (value) => ({
            'sensor.solar_power': [{ change: value }],
            'sensor.house_power': [{ change: 1 }],
        });
        const card = document.createElement('hnl-flow-bars-card');
        card.hass = makeHass(collection, () => new Promise((resolve) => resolvers.push(resolve)));

        card.setConfig(energyConfig);
        document.body.appendChild(card);
        await flush();

        expect(collection.subscribers.size).toBe(1);
        const [callback] = [...collection.subscribers];

        // Two rapid date changes → two concurrent fetches.
        callback({ start: new Date('2025-01-01'), end: new Date('2025-01-02') });
        callback({ start: new Date('2025-01-02'), end: new Date('2025-01-03') });
        await flush();
        expect(resolvers.length).toBe(2);

        // Newest fetch resolves first…
        resolvers[1](statsFor(222));
        await flush();
        // …then the stale one arrives late and must be discarded.
        resolvers[0](statsFor(111));
        await flush();

        expect(card._energyStats['sensor.solar_power']).toBe(222);

        card.disconnectedCallback();
        document.body.removeChild(card);
    });
});
