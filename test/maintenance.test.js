import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';

const config = { production: ['sensor.solar'], consumption: ['sensor.house'] };
const hass = (value = '10') => ({ states: {
    'sensor.solar': { entity_id: 'sensor.solar', state: value, attributes: {} },
    'sensor.house': { entity_id: 'sensor.house', state: '8', attributes: {} },
} });

beforeAll(async () => {
    const window = new Window();
    for (const key of ['document', 'customElements', 'HTMLElement', 'Element', 'Document',
        'Event', 'CustomEvent', 'ShadowRoot', 'CSSStyleSheet']) globalThis[key] = window[key];
    globalThis.window = window;
    await import('../src/hnl-flow-bars-card.js');
});
afterEach(() => document.body.replaceChildren());

async function mount(options = config, state = hass()) {
    const card = document.createElement('hnl-flow-bars-card');
    card.setConfig(options);
    card.hass = state;
    document.body.append(card);
    await card.updateComplete;
    return card;
}

describe('maintenance regressions', () => {
    it('rounds the actual remainder instead of subtracting rounded bars', async () => {
        const card = await mount({ ...config, production: ['sensor.solar', 'sensor.house'] }, {
            states: {
                ...hass('0.6').states,
                'sensor.house': { entity_id: 'sensor.house', state: '0.6', attributes: {} },
            },
        });
        expect(card._buildBarData(card._parsedConfig.production, 2).remainder).toBe(1);
    });
    it('renders a changed state in the same update', async () => {
        const card = await mount();
        card.hass = hass('25');
        await card.updateComplete;
        expect(card.shadowRoot.querySelector('.source-value').textContent).toContain('25');
    });

    it('renders config changes without waiting for another hass update', async () => {
        const card = await mount();
        card.setConfig({ ...config, production: [{ entity: 'sensor.solar', name: 'New name' }] });
        await card.updateComplete;
        expect(card.shadowRoot.textContent).toContain('New name');
    });

    it('refreshes names when the registry formatter changes without state changes', async () => {
        const state = hass();
        const card = await mount(config, { ...state, formatEntityName: () => 'Before' });
        card.hass = { ...state, formatEntityName: () => 'After', devices: {} };
        await card.updateComplete;
        expect(card.shadowRoot.textContent).toContain('After');
    });

    it('does not substitute a live total for missing period statistics', () => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig({ ...config, energy_date_selection: true });
        card.hass = hass('12000');
        card._energyStats = { 'sensor.solar': null, 'sensor.house': 5 };
        expect(card._parsedConfig.production[0].value).toBe(0);
        expect(card._parsedConfig.warnings[0].warning).toContain('no statistics');
    });

    it.each(['Infinity', '1e999', '12 watts'])('rejects invalid numeric state %s', (value) => {
        const card = document.createElement('hnl-flow-bars-card');
        card.setConfig(config);
        card.hass = hass(value);
        expect(card._parsedConfig.production[0].value).toBe(0);
        expect(card._parsedConfig.warnings).toHaveLength(1);
    });

    it('preserves zero opacity throughout an unrelated editor save', async () => {
        const editor = document.createElement('hnl-flow-bars-card-editor');
        editor.hass = hass();
        editor.setConfig({ ...config, global_bg_opacity: 0,
            production: [{ entity: 'sensor.solar', bg_opacity: 0 }],
            production_remainder: { bg_opacity: 0 }, consumption_remainder: { bg_opacity: 0 } });
        document.body.append(editor);
        await editor.updateComplete;
        const changed = vi.fn();
        editor.addEventListener('config-changed', changed);
        editor._textChanged('unit_of_measurement', { target: { value: 'W' } });
        const saved = changed.mock.calls[0][0].detail.config;
        expect(saved.global_bg_opacity).toBe(0);
        expect(saved.production[0].bg_opacity).toBe(0);
        expect(saved.production_remainder.bg_opacity).toBe(0);
        expect(saved.consumption_remainder.bg_opacity).toBe(0);
        expect(editor.shadowRoot.querySelector('input[type=range]').value).toBe('0');
        for (const tag of ['entity-list-editor', 'remainder-editor']) {
            const child = editor.shadowRoot.querySelector(tag);
            await child.updateComplete;
            expect(child.shadowRoot.querySelector('input[type=range]').value).toBe('0');
        }
    });

    it('binds editor hints and button icons to current HA component APIs', async () => {
        const editor = document.createElement('hnl-flow-bars-card-editor');
        editor.hass = hass();
        editor.setConfig(config);
        document.body.append(editor);
        await editor.updateComplete;
        expect(editor.shadowRoot.querySelector('ha-input').hint).toContain('Override the unit');
        expect(editor.shadowRoot.querySelector('ha-button ha-icon').slot).toBe('start');
    });
});
