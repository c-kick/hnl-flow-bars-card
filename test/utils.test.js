import { describe, it, expect } from 'vitest';
import {
    applyEntityValueOptions,
    applyFontSizeOptions,
    calculateRemainderWidthPercent,
    calculateWidthSegments,
    calculateWidthPercent,
    applyZeroThreshold,
    buildCardClasses,
    buildFlowBarsStyle,
    buildFlowBarsClasses,
    computeEntityIcon,
    normalizeCssVars,
    resolveBooleanConfig,
    syncHostCssVars,
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

describe('normalizeCssVars', () => {
    it('prefixes shorthand hnl flow bars variable names', () => {
        expect(normalizeCssVars({
            'destination-bg-opacity': 1,
            'label-edge-padding': '1rem',
        })).toEqual({
            '--hnl-flow-bars-destination-bg-opacity': '1',
            '--hnl-flow-bars-label-edge-padding': '1rem',
        });
    });

    it('preserves already-prefixed hnl flow bars custom properties', () => {
        expect(normalizeCssVars({
            '--hnl-flow-bars-card-row-height': '72px',
        })).toEqual({
            '--hnl-flow-bars-card-row-height': '72px',
        });
    });

    it('ignores non-card namespaces and malformed keys', () => {
        expect(normalizeCssVars({
            '--primary-color': 'red',
            background: 'red',
            '--hnl-other-value': '1px',
            '': '1px',
        })).toEqual({});
    });

    it('ignores empty values', () => {
        expect(normalizeCssVars({
            'label-padding': '',
            'border-radius': null,
            'card-grid-gap': undefined,
        })).toEqual({});
    });

    it('returns an empty object for non-object inputs', () => {
        expect(normalizeCssVars(null)).toEqual({});
        expect(normalizeCssVars(undefined)).toEqual({});
        expect(normalizeCssVars([])).toEqual({});
        expect(normalizeCssVars('destination-bg-opacity')).toEqual({});
        expect(normalizeCssVars(1)).toEqual({});
    });
});

describe('buildFlowBarsStyle', () => {
    it('merges css variables with font sizing options while font options win', () => {
        expect(buildFlowBarsStyle({
            css_vars: {
                'font-size-max': '30px',
                'destination-bg-opacity': 1,
            },
            font_size_max: '18px',
        })).toEqual({
            '--hnl-flow-bars-font-size-max': '18px',
            '--hnl-flow-bars-destination-bg-opacity': '1',
        });
    });

    it('omits invalid css vars from the style object', () => {
        expect(buildFlowBarsStyle({
            css_vars: {
                '--primary-color': 'red',
                '--hnl-other-value': '1px',
            },
        })).toEqual({});
    });
});

describe('syncHostCssVars', () => {
    it('sets new variables and removes stale variables from a style object', () => {
        const operations = [];
        const style = {
            setProperty(name, value) {
                operations.push(['set', name, value]);
            },
            removeProperty(name) {
                operations.push(['remove', name]);
            },
        };
        const previous = new Set([
            '--hnl-flow-bars-label-padding',
            '--hnl-flow-bars-card-row-height',
        ]);

        const applied = syncHostCssVars(style, previous, {
            '--hnl-flow-bars-card-row-height': '72px',
            '--hnl-flow-bars-destination-bg-opacity': '1',
        });

        expect(operations).toEqual([
            ['remove', '--hnl-flow-bars-label-padding'],
            ['set', '--hnl-flow-bars-card-row-height', '72px'],
            ['set', '--hnl-flow-bars-destination-bg-opacity', '1'],
        ]);
        expect([...applied]).toEqual([
            '--hnl-flow-bars-card-row-height',
            '--hnl-flow-bars-destination-bg-opacity',
        ]);
    });
});

describe('calculateWidthPercent', () => {
    it('preserves fractional percentages so complementary bars fill the row', () => {
        expect(calculateWidthPercent(65.4, 100)).toBe(65.4);
        expect(calculateWidthPercent(34.6, 100)).toBe(34.6);
    });

    it('rounds floating point noise to stable CSS precision', () => {
        expect(calculateWidthPercent(1, 3)).toBe(33.3333);
    });

    it('returns zero when maxValue is not positive', () => {
        expect(calculateWidthPercent(10, 0)).toBe(0);
    });

    it('keeps complementary raw values within rounding precision', () => {
        const maxValue = 15.26;
        const sourceWidth = calculateWidthPercent(10, maxValue);
        const remainderWidth = calculateWidthPercent(maxValue - 10, maxValue);

        expect(sourceWidth).toBe(65.5308);
        expect(remainderWidth).toBe(34.4692);
        expect(sourceWidth + remainderWidth).toBe(100);
    });
});

describe('calculateRemainderWidthPercent', () => {
    it('fills the remaining row width from already-rendered bars', () => {
        expect(calculateRemainderWidthPercent([{ width: 65.532 }])).toBe(34.468);
    });

    it('clamps negative remaining width to zero', () => {
        expect(calculateRemainderWidthPercent([{ width: 65.532 }, { width: 34.4828 }])).toBe(0);
    });
});

describe('calculateWidthSegments', () => {
    it('allocates rounded widths that add to 100 for a full row', () => {
        const widths = calculateWidthSegments([1, 1, 1], 3);

        expect(widths).toEqual([33.3333, 33.3333, 33.3334]);
        expect(widths.reduce((sum, width) => sum + width, 0)).toBe(100);
    });

    it('allocates source plus remainder widths that add to 100', () => {
        const widths = calculateWidthSegments([10, 5.26], 15.26);

        expect(widths).toEqual([65.5308, 34.4692]);
        expect(widths.reduce((sum, width) => sum + width, 0)).toBe(100);
    });

    it('returns zero widths when maxValue is not positive', () => {
        expect(calculateWidthSegments([10, 5], 0)).toEqual([0, 0]);
    });
});

describe('buildCardClasses', () => {
    it('keeps clip labels off by default', () => {
        expect(buildCardClasses({})).toBe('');
    });

    it('adds clip-labels when enabled', () => {
        expect(buildCardClasses({
            clip_labels: true,
        })).toBe('clip-labels');
    });

    it('preserves existing visual card classes', () => {
        expect(buildCardClasses({
            transparent: true,
            layout: 'native',
            theme: 'minimal',
            clip_labels: true,
        })).toBe('layout-native theme-minimal transparent minimal clip-labels');
    });

    it('adds namespaced layout and theme classes to the card', () => {
        expect(buildCardClasses({
            layout: 'accolade',
            theme: 'classic',
        })).toBe('layout-accolade theme-classic');
    });
});

describe('resolveBooleanConfig', () => {
    const hass = {
        states: {
            'input_boolean.enabled': { state: 'on' },
            'input_boolean.disabled': { state: 'off' },
            'binary_sensor.true': { state: 'true' },
            'binary_sensor.false': { state: 'false' },
            'sensor.unavailable': { state: 'unavailable' },
        },
    };

    it('preserves static boolean values', () => {
        expect(resolveBooleanConfig(true, hass)).toBe(true);
        expect(resolveBooleanConfig(false, hass)).toBe(false);
    });

    it('resolves entity-backed boolean values from Home Assistant state', () => {
        expect(resolveBooleanConfig({ entity: 'input_boolean.enabled' }, hass)).toBe(true);
        expect(resolveBooleanConfig({ entity: 'input_boolean.disabled' }, hass)).toBe(false);
        expect(resolveBooleanConfig({ entity: 'binary_sensor.true' }, hass)).toBe(true);
        expect(resolveBooleanConfig({ entity: 'binary_sensor.false' }, hass)).toBe(false);
    });

    it('falls back to the configured default when the entity cannot provide a boolean state', () => {
        expect(resolveBooleanConfig({ entity: 'sensor.missing', default: true }, hass)).toBe(true);
        expect(resolveBooleanConfig({ entity: 'sensor.unavailable', default: false }, hass)).toBe(false);
    });

    it('uses false as the default fallback for unsupported values', () => {
        expect(resolveBooleanConfig({ entity: 'sensor.missing' }, hass)).toBe(false);
        expect(resolveBooleanConfig('yes', hass)).toBe(false);
    });
});

describe('buildFlowBarsClasses', () => {
    it('adds namespaced layout and theme classes', () => {
        expect(buildFlowBarsClasses({
            layout: 'native',
            theme: 'split-pill',
        })).toContain('layout-native');
        expect(buildFlowBarsClasses({
            layout: 'native',
            theme: 'split-pill',
        })).toContain('theme-split-pill');
    });

    it('keeps legacy layout and theme classes for existing CSS', () => {
        expect(buildFlowBarsClasses({
            layout: 'native',
            theme: 'contained',
        })).toBe('layout-native theme-contained native contained');

        expect(buildFlowBarsClasses({
            layout: 'native',
            theme: 'split-pill',
        })).toBe('layout-native theme-split-pill native alternative');
    });

    it('preserves toggle and modifier classes', () => {
        expect(buildFlowBarsClasses({
            layout: 'accolade',
            theme: 'classic',
            gradient: true,
            slanted_edge: false,
            borders: false,
            show_names: false,
            animated: true,
        })).toBe('layout-accolade theme-classic gradient no-slant no-borders hide-names animated');
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
