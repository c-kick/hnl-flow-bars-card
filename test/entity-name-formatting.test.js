import { describe, it, expect } from 'vitest';
import {
  formatFlowEntityName,
} from '../src/utils.js';

describe('formatFlowEntityName', () => {
  const stateObj = {
    entity_id: 'sensor.living_room_thermostat_temperature',
    state: '21',
    attributes: {
      friendly_name: 'Temperature',
    },
  };

  it('uses hass.formatEntityName when Home Assistant provides it', () => {
    const calls = [];
    const hass = {
      formatEntityName: (...args) => {
        calls.push(args);
        return 'Thermostat · Temperature';
      },
    };

    expect(formatFlowEntityName(hass, stateObj)).toBe('Thermostat · Temperature');
    expect(calls).toEqual([
      [
        stateObj,
        [{ type: 'device' }, { type: 'entity' }],
        { separator: ' · ' },
      ],
    ]);
  });

  it('falls back to friendly_name when the formatter is unavailable', () => {
    expect(formatFlowEntityName({}, stateObj)).toBe('Temperature');
  });

  it('falls back to entity_id when there is no formatter or friendly_name', () => {
    const bareStateObj = {
      entity_id: 'sensor.power',
      state: '1',
      attributes: {},
    };

    expect(formatFlowEntityName({}, bareStateObj)).toBe('sensor.power');
  });

  it('falls back to the provided entity id when the state object is missing', () => {
    expect(formatFlowEntityName({}, undefined, 'sensor.missing')).toBe('sensor.missing');
  });
});
