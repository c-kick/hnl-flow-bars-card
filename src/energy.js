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
 * then fall back to the legacy key, then scan all `_energy*` keys.
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

    // Fallback: scan for any _energy* collection
    for (const key of Object.keys(conn)) {
        if (key.startsWith('_energy') && isCollection(conn[key])) {
            return conn[key];
        }
    }

    return null;
}

/**
 * Subscribe to the energy date selection on the current view.
 *
 * Polls for the energy collection (initialised by an `energy-date-selection`
 * card on the same view) and once found subscribes to its updates.
 *
 * @param {object}   hass     – Home Assistant connection object
 * @param {function} callback – Called with `{ start: Date, end: Date }` on
 *                              every date selection change and on initial load.
 *                              Also receives the full energy `data` object as
 *                              second argument.
 * @returns {Promise<function>} Unsubscribe function
 */
export function subscribeEnergyDateSelection(hass, callback) {
    let cancelled = false;
    let collectionUnsub = null;

    const promise = new Promise((resolve, reject) => {
        const start = Date.now();

        const poll = () => {
            if (cancelled) {
                resolve(() => {});
                return;
            }

            const collection = getEnergyDataCollection(hass);
            if (collection) {
                // Subscribe to collection updates (fires on date change)
                collectionUnsub = collection.subscribe((data) => {
                    if (!cancelled) {
                        callback(data);
                    }
                });

                // Trigger an initial refresh so data is fetched immediately
                if (typeof collection.refresh === 'function') {
                    collection.refresh();
                }

                resolve(() => {
                    cancelled = true;
                    if (collectionUnsub) {
                        collectionUnsub();
                        collectionUnsub = null;
                    }
                });
            } else if (Date.now() - start > ENERGY_DATA_TIMEOUT) {
                reject(
                    new Error(
                        'No energy data received. Make sure to add a ' +
                        '`type: energy-date-selection` card to this view.'
                    )
                );
            } else {
                setTimeout(poll, ENERGY_POLL_INTERVAL);
            }
        };

        poll();
    });

    // Return the promise that resolves to the unsubscribe function
    return promise;
}

/**
 * Determine the statistics period granularity based on the date range.
 *
 * @param {Date} start
 * @param {Date} end
 * @returns {"month"|"day"|"hour"}
 */
export function selectPeriod(start, end) {
    const msPerDay = 86_400_000;
    const days = (end - start) / msPerDay;
    if (days > 35) return 'month';
    if (days > 2) return 'day';
    return 'hour';
}

/**
 * Fetch recorder statistics for the given entities over a date range.
 *
 * Uses the `recorder/statistics_during_period` WebSocket API to retrieve
 * statistics, then sums them into a single value per entity.
 *
 * For cumulative sensors (energy meters) the net value is computed as the
 * difference between the last and first `state` values. For non-cumulative
 * sensors the `sum` field is used when available, otherwise `mean` is used.
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
            // Fallback: use the difference in cumulative `sum`
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
