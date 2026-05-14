import { describe, it, expect } from 'vitest';
import {
    applyEntityValueOptions,
    applyFontSizeOptions,
    applyZeroThreshold,
    computeEntityIcon,
} from '../src/utils.js';

describe('computeEntityIcon', () => {
    it('returns explicit icon from attributes', () => {
        const stateObj = {
            entity_id: 'sensor.test',
            attributes: { icon: 'mdi:custom-icon' },
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:custom-icon');
    });

    it('returns power icon for sensor with power device_class', () => {
        const stateObj = {
            entity_id: 'sensor.power',
            attributes: { device_class: 'power' },
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:flash');
    });

    it('returns energy icon for sensor with energy device_class', () => {
        const stateObj = {
            entity_id: 'sensor.energy',
            attributes: { device_class: 'energy' },
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:lightning-bolt');
    });

    it('returns temperature icon for sensor with temperature device_class', () => {
        const stateObj = {
            entity_id: 'sensor.temp',
            attributes: { device_class: 'temperature' },
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:thermometer');
    });

    it('returns generic sensor fallback for unknown device_class', () => {
        const stateObj = {
            entity_id: 'sensor.unknown',
            attributes: { device_class: 'something_new' },
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:eye');
    });

    it('returns generic sensor fallback when no device_class', () => {
        const stateObj = {
            entity_id: 'sensor.bare',
            attributes: {},
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:eye');
    });

    it('returns domain-specific icon for light', () => {
        const stateObj = {
            entity_id: 'light.living_room',
            attributes: {},
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:lightbulb');
    });

    it('returns domain-specific icon for switch', () => {
        const stateObj = {
            entity_id: 'switch.pump',
            attributes: {},
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:toggle-switch');
    });

    it('returns domain-specific icon for climate', () => {
        const stateObj = {
            entity_id: 'climate.hvac',
            attributes: {},
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:thermostat');
    });

    it('returns ultimate fallback for unknown domain', () => {
        const stateObj = {
            entity_id: 'custom_domain.thing',
            attributes: {},
        };
        expect(computeEntityIcon(stateObj)).toBe('mdi:bookmark-outline');
    });
});

describe('applyFontSizeOptions', () => {
    it('omits font size variables when no options are configured', () => {
        expect(applyFontSizeOptions({})).toEqual({});
    });

    it('maps configured scale and max to scoped CSS variables', () => {
        expect(applyFontSizeOptions({
            font_size_scale: 1.25,
            font_size_max: '18px',
        })).toEqual({
            '--hnl-flow-bars-font-size-scale': '1.25',
            '--hnl-flow-bars-font-size-fluid': '27.5cqb',
            '--hnl-flow-bars-font-size-max': '18px',
        });
    });

    it('ignores invalid scale values', () => {
        expect(applyFontSizeOptions({
            font_size_scale: 'large',
            font_size_max: '18px',
        })).toEqual({
            '--hnl-flow-bars-font-size-max': '18px',
        });
    });

    it('accepts CSS variable and calc values for max font size', () => {
        expect(applyFontSizeOptions({
            font_size_max: 'var(--ha-font-size-l)',
        })).toEqual({
            '--hnl-flow-bars-font-size-max': 'var(--ha-font-size-l)',
        });

        expect(applyFontSizeOptions({
            font_size_max: 'calc(var(--ha-font-size-m) * 1.25)',
        })).toEqual({
            '--hnl-flow-bars-font-size-max': 'calc(var(--ha-font-size-m) * 1.25)',
        });
    });

    it('ignores invalid max font size values', () => {
        expect(applyFontSizeOptions({
            font_size_max: '18',
        })).toEqual({});

        expect(applyFontSizeOptions({
            font_size_max: 'large',
        })).toEqual({});
    });
});

describe('applyZeroThreshold', () => {
    it('returns zero when the absolute value is at or below the threshold', () => {
        expect(applyZeroThreshold(3, 25)).toBe(0);
        expect(applyZeroThreshold(25, 25)).toBe(0);
        expect(applyZeroThreshold(-10, 25)).toBe(0);
    });

    it('keeps values above the threshold unchanged', () => {
        expect(applyZeroThreshold(26, 25)).toBe(26);
        expect(applyZeroThreshold(-26, 25)).toBe(-26);
    });

    it('ignores missing or invalid thresholds', () => {
        expect(applyZeroThreshold(3, null)).toBe(3);
        expect(applyZeroThreshold(3, '')).toBe(3);
        expect(applyZeroThreshold(3, 'abc')).toBe(3);
    });
});

describe('applyEntityValueOptions', () => {
    it('inverts values before applying zero_threshold', () => {
        expect(applyEntityValueOptions(-24, { invert: true, zero_threshold: 25 })).toBe(0);
        expect(applyEntityValueOptions(-26, { invert: true, zero_threshold: 25 })).toBe(26);
    });

    it('leaves non-inverted values unchanged before thresholding', () => {
        expect(applyEntityValueOptions(26, { invert: false, zero_threshold: 25 })).toBe(26);
        expect(applyEntityValueOptions(24, { invert: false, zero_threshold: 25 })).toBe(0);
    });
});
