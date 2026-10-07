/**
 * Energy date selection subscription and statistics fetching.
 *
 * When the card is placed on a view that contains an `energy-date-selection`
 * card, these utilities allow the card to subscribe to the selected date range
 * and fetch aggregated statistics for that period instead of showing live
 * entity states.
 *
 * Approach follows the same pattern used by ha-sankey-chart and other
 * community cards that integrate with the HA Energy Dashboard.
 */

const ENERGY_DATA_TIMEOUT = 10_000; // ms to wait for energy collection
const ENERGY_POLL_INTERVAL = 100;   // ms between polls

/**
 * Retrieve the energy data collection from the HA connection.
 * Returns null if not (yet) available.
 *
 * HA 2026.4+ changed the collection key from `_energy` to
 * `_energy_${hass.panelUrl}` (panel-specific). We try the new key first,
 * then fall back to the legacy key. Never use another panel's collection.
 */
export function getEnergyDataCollection(hass) {
    if (!hass?.connection) return null;
    const conn = hass.connection;
    const isCollection = (obj) => obj && typeof obj.subscribe === 'function';

    // HA 2026.4+: panel-specific key
    const panelKey = `_energy_${hass.panelUrl}`;
    if (isCollection(conn[panelKey])) return conn[panelKey];

    // Legacy key (HA < 2026.4)
    if (isCollection(conn['_energy'])) return conn['_energy'];

    return null;
}

/**
 * Subscribe to the energy date selection on the current view.
 *
 * Polls for the energy collection (initialised by an `energy-date-selection`
 * card on the same view) and once found subscribes to its updates.
 *
 * @param {object}   hass     – Home Assistant connection object
 * @param {function} callback – Receives the energy data, including start/end.
 * @param {object} options – Optional AbortSignal for pending polling and cleanup.
 * @returns {Promise<function>} Unsubscribe function
 */
export function subscribeEnergyDateSelection(hass, callback, { signal } = {}) {
    let cancelled = false;
    let collectionUnsub = null;
    let timer;

    const promise = new Promise((resolve, reject) => {
        const start = Date.now();
        const cleanup = () => {
            cancelled = true;
            clearTimeout(timer);
            signal?.removeEventListener('abort', cleanup);
            collectionUnsub?.();
            collectionUnsub = null;
            resolve(() => {});
        };
        if (signal?.aborted) {
            cleanup();
            return;
        }
        signal?.addEventListener('abort', cleanup, { once: true });

        const poll = () => {
            if (cancelled) {
                resolve(() => {});
                return;
            }

            const collection = getEnergyDataCollection(hass);
            if (collection) {
                try {
                    // Subscribe to collection updates (fires on date change)
                    collectionUnsub = collection.subscribe((data) => {
                        if (!cancelled) {
                            callback(data);
                        }
                    });

                    // HA's collection subscription handles its initial fetch.
                    // A forced refresh duplicates requests and can reject unhandled.
                    resolve(cleanup);
                } catch (error) {
                    signal?.removeEventListener('abort', cleanup);
                    reject(error);
                }
            } else if (Date.now() - start > ENERGY_DATA_TIMEOUT) {
                signal?.removeEventListener('abort', cleanup);
                reject(
                    new Error(
                        'No energy data received. Make sure to add a ' +
                        '`type: energy-date-selection` card to this view.'
                    )
                );
            } else {
                timer = setTimeout(poll, ENERGY_POLL_INTERVAL);
            }
        };

        poll();
    });

    // Return the promise that resolves to the unsubscribe function
    return promise;
}

/**
 * Use hourly buckets to preserve the selected range. Recorder expands day and
 * month requests to whole calendar periods in the server's time zone, which
 * includes unwanted readings for partial months and differing browser zones.
 *
 * @param {Date} start
 * @param {Date} end
 * @returns {"hour"}
 */
export function selectPeriod(start, end) {
    return 'hour';
}

/**
 * Fetch recorder statistics for the given entities over a date range.
 *
 * Uses the `recorder/statistics_during_period` WebSocket API to retrieve
 * statistics, then sums them into a single value per entity.
 *
 * The per-period `change` values are summed — this is correct for both
 * cumulative (total_increasing) and daily-resetting sensors. When no entry
 * has a `change` value, falls back to the cumulative `sum` difference, then
 * to averaging `mean` (measurement sensors).
 *
 * @param {object}   hass       – Home Assistant connection object
 * @param {Date}     startTime  – Start of the period
 * @param {Date}     endTime    – End of the period
 * @param {string[]} entityIds  – Entity IDs to fetch statistics for
 * @returns {Promise<Record<string, number>>} Map of entity_id → aggregated value
 */
export async function fetchStatistics(hass, startTime, endTime, entityIds) {
    if (!entityIds.length) return {};

    const period = selectPeriod(startTime, endTime);

    const stats = await hass.callWS({
        type: 'recorder/statistics_during_period',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        statistic_ids: entityIds,
        period,
        types: ['change', 'sum', 'mean'],
    });

    const result = {};

    for (const entityId of entityIds) {
        const entries = stats[entityId];
        if (!entries || entries.length === 0) {
            result[entityId] = null;
            continue;
        }

        // Prefer summing `change` values — works correctly for both
        // cumulative (total_increasing) and daily-resetting sensors.
        const changes = entries.filter(e => e.change != null).map(e => e.change);
        if (changes.length) {
            result[entityId] = changes.reduce((a, b) => a + b, 0);
        } else if (entries[entries.length - 1].sum != null && entries[0].sum != null) {
            // Fallback: difference in cumulative `sum`. Imperfect — `sum` is
            // sampled at the END of each bucket, so the first bucket's change
            // is missed — but recorder returns `change` for all sum-type
            // statistics, so this should never fire in practice.
            result[entityId] = entries[entries.length - 1].sum - entries[0].sum;
        } else {
            // Fallback: average the mean values across all entries
            const means = entries.filter(e => e.mean != null).map(e => e.mean);
            result[entityId] = means.length
                ? means.reduce((a, b) => a + b, 0) / means.length
                : null;
        }
    }

    return result;
}
