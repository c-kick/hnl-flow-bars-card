import { describe, it, expect } from 'vitest';
import {
  buildEntitySuggestions,
  isSuggestionCandidate,
} from '../src/utils.js';

function makeHass(states) {
  return { states };
}

const solarPower = {
  entity_id: 'sensor.solar_power',
  state: '1234',
  attributes: {
    device_class: 'power',
    unit_of_measurement: 'W',
    friendly_name: 'Solar power',
  },
};

const housePower = {
  entity_id: 'sensor.house_power',
  state: '900',
  attributes: {
    device_class: 'power',
    unit_of_measurement: 'W',
    friendly_name: 'House power',
  },
};

describe('card picker entity suggestions', () => {
  it('does not suggest for missing, non-sensor, non-numeric, or unavailable entities', () => {
    const hass = makeHass({
      'light.kitchen': {
        entity_id: 'light.kitchen',
        state: 'on',
        attributes: {},
      },
      'sensor.temperature': {
        entity_id: 'sensor.temperature',
        state: '21.5',
        attributes: { device_class: 'temperature', unit_of_measurement: '°C' },
      },
      'sensor.power_factor': {
        entity_id: 'sensor.power_factor',
        state: '0.95',
        attributes: { unit_of_measurement: '%' },
      },
      'sensor.unavailable_power': {
        entity_id: 'sensor.unavailable_power',
        state: 'unavailable',
        attributes: { device_class: 'power', unit_of_measurement: 'W' },
      },
      'sensor.text_power': {
        entity_id: 'sensor.text_power',
        state: 'idle',
        attributes: { device_class: 'power', unit_of_measurement: 'W' },
      },
    });

    expect(isSuggestionCandidate(hass, 'sensor.missing')).toBe(false);
    expect(isSuggestionCandidate(hass, 'light.kitchen')).toBe(false);
    expect(isSuggestionCandidate(hass, 'sensor.temperature')).toBe(false);
    expect(isSuggestionCandidate(hass, 'sensor.power_factor')).toBe(false);
    expect(isSuggestionCandidate(hass, 'sensor.unavailable_power')).toBe(false);
    expect(isSuggestionCandidate(hass, 'sensor.text_power')).toBe(false);
    expect(buildEntitySuggestions(hass, 'sensor.temperature')).toBeNull();
  });

  it('suggests two valid configs for a selected power sensor when a counterpart exists', () => {
    const hass = makeHass({
      'sensor.solar_power': solarPower,
      'sensor.house_power': housePower,
    });

    const suggestions = buildEntitySuggestions(hass, 'sensor.solar_power');

    expect(suggestions).toEqual([
      {
        label: 'As production',
        config: {
          type: 'custom:hnl-flow-bars-card',
          production: [{ entity: 'sensor.solar_power' }],
          consumption: [{ entity: 'sensor.house_power' }],
        },
      },
      {
        label: 'As consumption',
        config: {
          type: 'custom:hnl-flow-bars-card',
          production: [{ entity: 'sensor.house_power' }],
          consumption: [{ entity: 'sensor.solar_power' }],
        },
      },
    ]);
  });

  it('uses the selected entity on both sides only when no separate counterpart exists', () => {
    const hass = makeHass({
      'sensor.solar_power': solarPower,
    });

    const suggestions = buildEntitySuggestions(hass, 'sensor.solar_power');

    expect(suggestions).toEqual([
      {
        label: 'As production',
        config: {
          type: 'custom:hnl-flow-bars-card',
          production: [{ entity: 'sensor.solar_power' }],
          consumption: [{ entity: 'sensor.solar_power' }],
        },
      },
      {
        label: 'As consumption',
        config: {
          type: 'custom:hnl-flow-bars-card',
          production: [{ entity: 'sensor.solar_power' }],
          consumption: [{ entity: 'sensor.solar_power' }],
        },
      },
    ]);
  });
});
