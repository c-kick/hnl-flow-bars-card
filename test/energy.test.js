import { describe, it, expect, vi, afterEach } from 'vitest';
import { selectPeriod, fetchStatistics, getEnergyDataCollection, subscribeEnergyDateSelection } from '../src/energy.js';

afterEach(() => vi.useRealTimers());

describe('energy isolation and cleanup', () => {
    it('waits for the current panel instead of taking another dashboard collection', () => {
        expect(getEnergyDataCollection({ panelUrl: 'second', connection: {
            _energy_first: { subscribe() {} },
        } })).toBeNull();
    });

    it('prefers the current panel over the legacy collection', () => {
        const current = { subscribe() {} };
        expect(getEnergyDataCollection({ panelUrl: 'current', connection: {
            _energy_current: current, _energy: { subscribe() {} },
        } })).toBe(current);
    });

    it('cancels polling immediately when disconnected', async () => {
        vi.useFakeTimers();
        const controller = new AbortController();
        const promise = subscribeEnergyDateSelection({ connection: {} }, vi.fn(), { signal: controller.signal });
        expect(vi.getTimerCount()).toBe(1);
        controller.abort();
        await promise;
        expect(vi.getTimerCount()).toBe(0);
    });

    it('rejects subscription failures even when the collection appears after polling', async () => {
        vi.useFakeTimers();
        const hass = { connection: {} };
        const promise = subscribeEnergyDateSelection(hass, vi.fn());
        const result = expect(promise).rejects.toThrow('subscription failed');
        hass.connection._energy = { subscribe() { throw new Error('subscription failed'); } };
        await vi.advanceTimersByTimeAsync(100);
        await result;
        expect(vi.getTimerCount()).toBe(0);
    });

    it('lets the collection own its initial refresh and releases it on abort', async () => {
        const unsub = vi.fn();
        const collection = { subscribe: vi.fn(() => unsub), refresh: vi.fn() };
        const controller = new AbortController();
        const cleanup = await subscribeEnergyDateSelection({ connection: { _energy: collection } }, vi.fn(), { signal: controller.signal });
        expect(collection.refresh).not.toHaveBeenCalled();
        controller.abort();
        cleanup();
        expect(unsub).toHaveBeenCalledTimes(1);
    });

    it('preserves partial-month query boundaries', async () => {
        const callWS = vi.fn(async () => ({}));
        const start = new Date('2026-07-15T22:00:00Z');
        const end = new Date('2026-09-02T21:59:59Z');
        await fetchStatistics({ callWS }, start, end, ['sensor.energy']);
        expect(callWS).toHaveBeenCalledWith(expect.objectContaining({
            start_time: start.toISOString(), end_time: end.toISOString(), period: 'hour',
        }));
    });
});

describe('selectPeriod', () => {
    it('returns "hour" for ranges of 2 days or less', () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date('2025-01-02T00:00:00Z');
        expect(selectPeriod(start, end)).toBe('hour');
    });

    it('returns "hour" for ranges exactly 2 days', () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date('2025-01-03T00:00:00Z');
        expect(selectPeriod(start, end)).toBe('hour');
    });

    it('returns "hour" for ranges between 2 and 35 days', () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date('2025-01-10T00:00:00Z');
        expect(selectPeriod(start, end)).toBe('hour');
    });

    it('returns "hour" for exactly 35 days', () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date('2025-02-05T00:00:00Z');
        expect(selectPeriod(start, end)).toBe('hour');
    });

    it('returns "hour" for ranges over 35 days', () => {
        const start = new Date('2025-01-01T00:00:00Z');
        const end = new Date('2025-06-01T00:00:00Z');
        expect(selectPeriod(start, end)).toBe('hour');
    });
});

describe('getEnergyDataCollection', () => {
    it('returns null when hass is null', () => {
        expect(getEnergyDataCollection(null)).toBeNull();
    });

    it('returns null when connection has no _energy', () => {
        expect(getEnergyDataCollection({ connection: {} })).toBeNull();
    });

    it('returns the energy collection when available', () => {
        const collection = { subscribe: () => {} };
        const hass = { connection: { _energy: collection } };
        expect(getEnergyDataCollection(hass)).toBe(collection);
    });
});

describe('fetchStatistics', () => {
    it('returns empty object for empty entity list', async () => {
        const hass = { callWS: () => ({}) };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            [],
        );
        expect(result).toEqual({});
    });

    it('sums per-period change values (handles daily-resetting sensors)', async () => {
        const hass = {
            callWS: async () => ({
                'sensor.energy': [
                    { change: 5, sum: 105, mean: null },
                    { change: 3, sum: 108, mean: null },
                    { change: 7, sum: 115, mean: null },
                ],
            }),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.energy'],
        );
        expect(result['sensor.energy']).toBe(15); // 5 + 3 + 7, never last - first state
    });

    it('computes value from sum difference when change is not available', async () => {
        const hass = {
            callWS: async () => ({
                'sensor.energy': [
                    { state: null, sum: 10, mean: null },
                    { state: null, sum: 30, mean: null },
                    { state: null, sum: 50, mean: null },
                ],
            }),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.energy'],
        );
        expect(result['sensor.energy']).toBe(40); // 50 - 10
    });

    it('falls back to mean average when no state or sum', async () => {
        const hass = {
            callWS: async () => ({
                'sensor.temp': [
                    { state: null, sum: null, mean: 20 },
                    { state: null, sum: null, mean: 22 },
                    { state: null, sum: null, mean: 24 },
                ],
            }),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.temp'],
        );
        expect(result['sensor.temp']).toBe(22); // (20+22+24)/3
    });

    it('returns null for entities with no statistics', async () => {
        const hass = {
            callWS: async () => ({
                'sensor.missing': [],
            }),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.missing'],
        );
        expect(result['sensor.missing']).toBeNull();
    });

    it('returns null for entities not in response', async () => {
        const hass = {
            callWS: async () => ({}),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.unknown'],
        );
        expect(result['sensor.unknown']).toBeNull();
    });

    it('selects correct period based on date range', async () => {
        let capturedMsg = null;
        const hass = {
            callWS: async (msg) => {
                capturedMsg = msg;
                return {};
            },
        };

        // 60 day range → preserve boundaries with "hour"
        await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-03-02'),
            ['sensor.a'],
        );
        expect(capturedMsg.period).toBe('hour');

        // 7 day range → preserve boundaries with "hour"
        await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-08'),
            ['sensor.a'],
        );
        expect(capturedMsg.period).toBe('hour');

        // 1 day range → should use "hour"
        await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.a'],
        );
        expect(capturedMsg.period).toBe('hour');
    });

    it('handles multiple entities', async () => {
        const hass = {
            callWS: async () => ({
                'sensor.solar': [
                    { change: 200, sum: null, mean: null },
                    { change: 300, sum: null, mean: null },
                ],
                'sensor.grid': [
                    { change: 50, sum: null, mean: null },
                    { change: 150, sum: null, mean: null },
                ],
            }),
        };
        const result = await fetchStatistics(
            hass,
            new Date('2025-01-01'),
            new Date('2025-01-02'),
            ['sensor.solar', 'sensor.grid'],
        );
        expect(result['sensor.solar']).toBe(500);
        expect(result['sensor.grid']).toBe(200);
    });
});
