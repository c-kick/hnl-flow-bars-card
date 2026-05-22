import { LitElement, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { applyEntityValueOptions, applyFontSizeOptions, buildCardClasses, buildFlowBarsClasses, calculateWidthSegments, computeEntityIcon, resolveLayoutAndTheme } from './utils.js';
import {
    CARD_VERSION, CARD_NAME, CARD_DESCRIPTION,
} from './const.js';
import { subscribeEnergyDateSelection, fetchStatistics } from './energy.js';
import { hnlFlowBarsCardScaffolding } from './scaffolding.js';
import { hnlFlowBarsCardStyles } from './styles.js';
import './editor/hnl-flow-bars-card-editor.js';

console.info(
    `%c ${CARD_NAME.toUpperCase()} %c v${CARD_VERSION} `,
    'color: white; background: #555; font-weight: bold;',
    'color: white; background: #007acc; font-weight: bold;',
);

window.customCards = window.customCards || [];
window.customCards.push({
    type: CARD_NAME,
    name: 'HNL Flow Bars Card',
    description: CARD_DESCRIPTION,
    preview: true,
    documentationURL: 'https://github.com/c-kick/hnl-flow-bars-card',
});

class HnlFlowBarsCard extends LitElement {

    _updatedParsedConfig = null;
    _energyStats = null;
    _energyError = null;
    _energyLoading = false;
    _energyUnsub = null;

    //part of LitElement interface
    static get properties() {
        return {
            hass: {},
            layout: { type: String },
            _energyStats: { state: true },
            _energyError: { state: true },
            _energyLoading: { state: true },
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._subscribeEnergy();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._unsubscribeEnergy();
    }

    _subscribeEnergy() {
        if (!this._rawConfig?.energy_date_selection) return;

        this._energyLoading = true;
        this._energyError = null;

        subscribeEnergyDateSelection(this.hass, async (data) => {
            if (!this.hass) return;

            const entityIds = [
                ...this._rawConfig.production.map(p => p.entity),
                ...this._rawConfig.consumption.map(c => c.entity),
            ];

            try {
                const stats = await fetchStatistics(
                    this.hass,
                    data.start,
                    data.end || new Date(),
                    entityIds,
                );
                this._energyStats = stats;
                this._energyLoading = false;
                this._energyError = null;
                // Invalidate parsed config so it re-renders with new stats
                this._updatedParsedConfig = this._hydrateParsedConfig();
                this.requestUpdate();
            } catch (err) {
                this._energyError = err.message || 'Failed to fetch statistics';
                this._energyLoading = false;
            }
        }).then(unsub => {
            this._energyUnsub = unsub;
        }).catch(err => {
            this._energyError = err.message;
            this._energyLoading = false;
        });
    }

    _unsubscribeEnergy() {
        if (this._energyUnsub) {
            this._energyUnsub();
            this._energyUnsub = null;
        }
        this._energyStats = null;
        this._energyError = null;
        this._energyLoading = false;
    }

    _roundOff(x, digits = this._parsedConfig.rounding) {
        return typeof x === "number"
            ? Math.round(x * Math.pow(10, digits)) / Math.pow(10, digits)
            : 0;
    }

    _dispatchHassEvent(node, type, detail, options = {}) {
        const event = new CustomEvent(type, {
            detail,
            bubbles: options.bubbles ?? true,
            cancelable: options.cancelable ?? false,
            composed: options.composed ?? true,
        });
        node.dispatchEvent(event);
        return event;
    }

    _handleAction(entityId, actionType = 'tap') {
        if (!entityId) return;

        const actionConfig = {
            entity: entityId,
            tap_action: { action: 'more-info' },
            hold_action: { action: 'more-info' },
            double_tap_action: { action: 'none' },
        };

        this._dispatchHassEvent(this, "hass-action", {
            config: actionConfig,
            action: actionType,
        });
    }

    get _parsedConfig() {
        if (!this._updatedParsedConfig && this.hass) {
            this._updatedParsedConfig = this._hydrateParsedConfig();
        }
        return this._updatedParsedConfig;
    }

    _hydrateParsedConfig() {
        const globalColor = this._rawConfig.global_color;
        const globalTextColor = this._rawConfig.global_text_color;
        const globalBgOpacity = this._rawConfig.global_bg_opacity;

        const hydrate = (items, fallbackIcon, colorType) => {
          return items.map((item, index) => {
            const entityId = item.entity;
            const stateObj = this.hass?.states[entityId];
            const fallbackVar = `var(--hnl-flow-bars-color-${colorType}-${index % 4}, var(--hnl-flow-bars-color-default))`;

            if (!stateObj) {
              return {
                entity_id: entityId,
                name: item.name || entityId,
                value: 0,
                icon: item.icon || fallbackIcon,
                color: item.color || globalColor || fallbackVar,
                bg_opacity: item.bg_opacity || globalBgOpacity || 'inherit',
                text_color: item.text_color || globalTextColor || 'inherit',
                unit_of_measurement: item.unit_of_measurement,
                warning: `${entityId}: entity not found`,
              };
            }

            // Use energy statistics when available, otherwise use live state
            const useEnergy = this._rawConfig.energy_date_selection && this._energyStats;
            const raw = useEnergy && this._energyStats[entityId] != null
                ? String(this._energyStats[entityId])
                : stateObj.state;
            const isUnavailable = raw === 'unavailable' || raw === 'unknown';
            const parsed = parseFloat(raw);
            const isNonNumeric = !isUnavailable && isNaN(parsed);
            let value = applyEntityValueOptions(parsed || 0, item);
            value = Math.max(0, value);
            const displayName = item.name || stateObj.attributes.friendly_name || entityId;
            let warning = null;
            if (useEnergy && this._energyStats[entityId] == null) {
              warning = `${displayName}: no statistics available for this period`;
            } else if (isUnavailable) {
              warning = `${displayName}: ${raw}`;
            } else if (isNonNumeric) {
              warning = `${displayName}: non-numeric state "${raw}"`;
            }

            const unit = item.unit_of_measurement ?? stateObj.attributes.unit_of_measurement;

            return {
              entity_id: entityId,
              name: displayName,
              value,
              icon: item.icon || computeEntityIcon(stateObj) || fallbackIcon,
              color: item.color || globalColor || fallbackVar,
              bg_opacity: item.bg_opacity || globalBgOpacity || 'inherit',
              text_color: item.text_color || globalTextColor || 'inherit',
              hatched: item.hatched || false,
              invert: item.invert || false,
              zero_threshold: item.zero_threshold,
              unit_of_measurement: unit,
              warning,
            };
          });
        };


        const production = hydrate(
            this._rawConfig.production,
            'mdi:solar-power-variant',
            'production',
        );
        const consumption = hydrate(
            this._rawConfig.consumption,
            'mdi:power-plug',
            'consumption',
        );

        return {
            production,
            consumption,
            consumption_remainder: this._rawConfig.consumption_remainder,
            production_remainder: this._rawConfig.production_remainder,
            rounding: this._rawConfig.rounding,
            hide_zero_values: this._rawConfig.hide_zero_values,
            unit_of_measurement: this._rawConfig.unit_of_measurement,
            font_size_scale: this._rawConfig.font_size_scale,
            font_size_max: this._rawConfig.font_size_max,
            card_class: buildCardClasses(this._rawConfig),
            warnings: [...production, ...consumption].filter((ent) => ent.warning),
        };
    }

    _buildBarData(entities, maxValue, unitOverride) {
        const renderableEntities = entities.filter((ent) => this._shouldShowBar(ent));
        const rawTotal = entities.reduce((sum, ent) => sum + ent.value, 0);
        const renderableTotal = renderableEntities.reduce((sum, ent) => sum + ent.value, 0);
        const rawRemainder = Math.max(0, maxValue - rawTotal);
        const total = entities.reduce((sum, ent) => sum + this._roundOff(ent.value), 0);
        const remainder = this._roundOff(maxValue - total);
        const allocatedRemainder = rawRemainder > 0 && remainder > 0
            ? Math.max(0, maxValue - renderableTotal)
            : 0;
        const values = allocatedRemainder > 0
            ? [...renderableEntities.map((ent) => ent.value), allocatedRemainder]
            : renderableEntities.map((ent) => ent.value);
        const widths = calculateWidthSegments(values, maxValue);
        const bars = entities.map((ent, index) => {
            const value = ent.value;
            const unit = unitOverride || ent.unit_of_measurement;
            const renderableIndex = renderableEntities.indexOf(ent);
            const width = renderableIndex >= 0 ? widths[renderableIndex] ?? 0 : 0;
            return {
                entity_id: ent.entity_id,
                name: ent.name ?? ent.entity_id,
                value,
                icon: ent.icon,
                color: ent.color,
                bg_opacity: ent.bg_opacity,
                text_color: ent.text_color,
                width,
                unit_of_measurement: unit,
            };
        });

        const remainderWidth = allocatedRemainder > 0 ? widths.at(-1) ?? 0 : 0;
        return { bars, total, remainder, remainderWidth };
    }

    _shouldShowBar(ent) {
        return this._roundOff(ent.value) > 0 || !this._parsedConfig.hide_zero_values;
    }

    get _flowBarsClasses() {
        return buildFlowBarsClasses(this._rawConfig);
    }

    _getAccoladeClasses(isRemainder = false) {
        if (isRemainder && this._rawConfig.hatched) {
            return 'hatched';
        }
        return '';
    }

    _animDuration(width) {
        // 0% → 1.5s (slow), 100% → 0.3s (fast)
        return `${(1.5 - (Math.max(0, Math.min(100, width)) / 100) * 1.2).toFixed(2)}s`;
    }

    _renderSourceLabel(ent) {
        const unit = this._parsedConfig.unit_of_measurement || ent.unit_of_measurement || '';
        return html`<hnl-flow-bars-card-source-label
            title="${ent.name}: ${this._roundOff(ent.value)} ${unit}"
            style="--background-color:${ent.color};--text-color:${ent.text_color};--width-value:${ent.width}%;--source-bg-opacity:${ent.bg_opacity};--animation-duration:${this._animDuration(ent.width)};cursor:pointer;"
            @click=${() => this._handleAction(ent.entity_id)}
        ><div>
            <span class="hnl-flow-bars-card-value-pill"><span class="source-value"><ha-icon icon="${ent.icon || 'mdi:eye'}"></ha-icon><span>${this._roundOff(ent.value)} ${unit}</span></span></span>
            <span class="entity-name">${ent.name}</span>
        </div></hnl-flow-bars-card-source-label>`;
    }

    _renderAccolade(ent) {
        return html`<hnl-flow-bars-card-source-accolade
            class="${this._getAccoladeClasses()}"
            style="--background-color:${ent.color};--width-value:${ent.width}%;--hnl-flow-bars-accolade-bg-opacity:${ent.bg_opacity};--animation-duration:${this._animDuration(ent.width)};"
        ></hnl-flow-bars-card-source-accolade>`;
    }

    _renderDestination(ent) {
        const unit = this._parsedConfig.unit_of_measurement || ent.unit_of_measurement || '';
        return html`<hnl-flow-bars-card-destination
            title="${ent.name}: ${this._roundOff(ent.value)} ${unit}"
            style="--background-color:${ent.color};--hnl-flow-bars-destination-bg-opacity:${ent.bg_opacity};--text-color:${ent.text_color};--width-value:${ent.width}%;--animation-duration:${this._animDuration(ent.width)};cursor:pointer;"
            @click=${() => this._handleAction(ent.entity_id)}
        ><hnl-flow-bars-card-destination-label>
            <span class="hnl-flow-bars-card-value-pill"><span class="destination-value"><ha-icon icon="${ent.icon}"></ha-icon><span>${this._roundOff(ent.value)} ${unit}</span></span></span>
            <span class="entity-name">${ent.name}</span>
        </hnl-flow-bars-card-destination-label></hnl-flow-bars-card-destination>`;
    }

    _renderRemainder(type, remainderValue, width = 50) {
        const cfg = this._parsedConfig[`${type}_remainder`];
        // Unit priority: explicit remainder unit > global unit > inherited from first source/destination entity
        const inheritedUnit = cfg._inherit_unit_from
            ? this.hass?.states[cfg._inherit_unit_from]?.attributes?.unit_of_measurement
            : null;
        const unit = cfg.unit_of_measurement || this._parsedConfig.unit_of_measurement || inheritedUnit || '';
        const hatchedClass = this._rawConfig.hatched ? 'hatched' : '';
        if (type === 'production') {
            return html`<hnl-flow-bars-card-source-label
                class="${hatchedClass}"
                title="${cfg.name}: ${remainderValue} ${unit}"
                style="--background-color:${cfg.color};--text-color:${cfg.text_color};--width-value:${width}%;--source-bg-opacity:${cfg.bg_opacity};--animation-duration:${this._animDuration(width)};"
            ><div>
                <span class="hnl-flow-bars-card-value-pill"><span class="source-value"><ha-icon icon="${cfg.icon}"></ha-icon><span>${remainderValue} ${unit}</span></span></span>
                <span class="entity-name">${cfg.name}</span>
            </div></hnl-flow-bars-card-source-label>`;
        }
        return html`<hnl-flow-bars-card-destination
            class="${hatchedClass}"
            title="${cfg.name}: ${remainderValue} ${unit}"
            style="--background-color:${cfg.color};--text-color:${cfg.text_color};--width-value:${width}%;--hnl-flow-bars-destination-bg-opacity:${cfg.bg_opacity};--animation-duration:${this._animDuration(width)};"
        ><hnl-flow-bars-card-destination-label>
            <span class="hnl-flow-bars-card-value-pill"><span class="destination-value"><ha-icon icon="${cfg.icon}"></ha-icon><span>${remainderValue} ${unit}</span></span></span>
            <span class="entity-name">${cfg.name}</span>
        </hnl-flow-bars-card-destination-label></hnl-flow-bars-card-destination>`;
    }

    _renderRemainderAccolade(type, width = 50) {
        const cfg = this._parsedConfig[`${type}_remainder`];
        return html`<hnl-flow-bars-card-source-accolade
            class="${this._getAccoladeClasses(true)}"
            style="--background-color:${cfg.color};--width-value:${width}%;--hnl-flow-bars-accolade-bg-opacity:${cfg.bg_opacity};--animation-duration:${this._animDuration(width)};"
        ></hnl-flow-bars-card-source-accolade>`;
    }

    _normalizeEntityConfig(input) {
        if (typeof input === "string") {
            return [{ entity: input }];
        }
        if (Array.isArray(input)) {
            return input.map((item) =>
                typeof item === "string" ? { entity: item } : item
            );
        }
        if (typeof input === "object" && input.entity) {
            return [input];
        }
        throw new Error("Invalid entity format: " + JSON.stringify(input));
    }

    //part of LitElement interface
    render() {
        if (!this.hass || !this._parsedConfig) {
            return html``;
        }

        if (this._rawConfig.energy_date_selection && this._energyError) {
            return html`
                <ha-card class="${this._parsedConfig.card_class}">
                    <div class="card-content">
                        <ha-alert alert-type="error">${this._energyError}</ha-alert>
                    </div>
                </ha-card>
            `;
        }

        if (this._rawConfig.energy_date_selection && this._energyLoading && !this._energyStats) {
            return html`
                <ha-card class="${this._parsedConfig.card_class}">
                    <div class="card-content">
                        <ha-alert alert-type="info">Loading energy data…</ha-alert>
                    </div>
                </ha-card>
            `;
        }

        const productionTotal = this._parsedConfig.production.reduce((sum, ent) => sum + ent.value, 0);
        const consumptionTotal = this._parsedConfig.consumption.reduce((sum, ent) => sum + ent.value, 0);

        const maxValue = Math.max(productionTotal, consumptionTotal);

        const {
            bars: prodBars,
            total: prodSum,
            remainder: prodRemainder,
            remainderWidth: prodRemainderWidth,
        } = this._buildBarData(
            this._parsedConfig.production,
            maxValue,
            this._parsedConfig.unit_of_measurement
        );

        const {
            bars: consBars,
            total: consSum,
            remainder: consRemainder,
            remainderWidth: consRemainderWidth,
        } = this._buildBarData(
            this._parsedConfig.consumption,
            maxValue,
            this._parsedConfig.unit_of_measurement
        );

        const barData = {
            production: prodBars,
            consumption: consBars,
        };

        const totals = {
            production: prodSum,
            production_remainder: productionTotal >= consumptionTotal ? 0 : prodRemainder,
            consumption: consSum,
            consumption_remainder: consumptionTotal >= productionTotal ? 0 : consRemainder,
        };

        const visibleProd = barData.production.filter((ent) => this._shouldShowBar(ent));
        const visibleCons = barData.consumption.filter((ent) => this._shouldShowBar(ent));
        const flowBarsStyle = applyFontSizeOptions(this._parsedConfig);

        return html`
            <ha-card class="${this._parsedConfig.card_class}">
                ${this._parsedConfig.warnings.length ? html`
                    <div class="card-warnings">
                        ${this._parsedConfig.warnings.map((ent) => html`
                            <ha-alert alert-type="warning">${ent.warning}</ha-alert>
                        `)}
                    </div>
                ` : null}
                <div class="card-content">
        <hnl-flow-bars class="${this._flowBarsClasses}" style=${styleMap(flowBarsStyle)}>
            <hnl-flow-bars-card-source-group>
                ${visibleProd.map((ent) => this._renderSourceLabel(ent))}
                ${totals.production_remainder > 0 ? this._renderRemainder('production', totals.production_remainder, prodRemainderWidth) : null}
            </hnl-flow-bars-card-source-group>
            <hnl-flow-bars-card-accolade-group>
                ${visibleProd.map((ent) => this._renderAccolade(ent))}
                ${totals.production_remainder > 0 ? this._renderRemainderAccolade('production', prodRemainderWidth) : null}
            </hnl-flow-bars-card-accolade-group>
            <hnl-flow-bars-card-destination-group>
                ${visibleCons.map((ent) => this._renderDestination(ent))}
                ${totals.consumption_remainder > 0 ? this._renderRemainder('consumption', totals.consumption_remainder, consRemainderWidth) : null}
            </hnl-flow-bars-card-destination-group>
        </hnl-flow-bars>
                </div>
            </ha-card>
        `;
    }

    //part of HASS card API
    updated(changedProps) {
        if (!changedProps.has("hass")) return;

        const changedHass = changedProps.get("hass");
        if (!changedHass) return;

        const prevStates = changedHass.states;
        const currentStates = this.hass.states;

        // Collect all relevant entity_ids from the config
        const relevantEntities = [
            ...this._rawConfig.production.map((p) => p.entity),
            ...this._rawConfig.consumption.map((c) => c.entity),
        ];

        const anyChanged = relevantEntities.some((entity_id) => {
            const oldState = prevStates[entity_id];
            const newState = currentStates[entity_id];
            return !oldState || !newState || oldState.state !== newState.state;
        });

        if (anyChanged) {
            this._updatedParsedConfig = this._hydrateParsedConfig();
        }
    }

    //part of HASS card API
    setConfig(config) {
        if (!config.production || !config.consumption) {
            throw new Error("You need to define both production and consumption entities");
        }

        const resolved = resolveLayoutAndTheme(config);
        const production = this._normalizeEntityConfig(config.production);
        const consumption = this._normalizeEntityConfig(config.consumption);
        this._rawConfig = {
            production,
            consumption,
            production_remainder: {
                name: config.production_remainder?.name || "Shortfall",
                icon: config.production_remainder?.icon || 'mdi:eye',
                color: config.production_remainder?.color || config.global_color || 'var(--hnl-flow-bars-color-shortfall)',
                bg_opacity: config.production_remainder?.bg_opacity || config.global_bg_opacity || 'inherit',
                text_color: config.production_remainder?.text_color || config.global_text_color || 'inherit',
                unit_of_measurement: config.production_remainder?.unit_of_measurement || null,
                _inherit_unit_from: production[0]?.entity || null,
            },
            consumption_remainder: {
                name: config.consumption_remainder?.name || "Surplus",
                icon: config.consumption_remainder?.icon || 'mdi:eye',
                color: config.consumption_remainder?.color || config.global_color || 'var(--hnl-flow-bars-color-surplus)',
                bg_opacity: config.consumption_remainder?.bg_opacity || config.global_bg_opacity || 'inherit',
                text_color: config.consumption_remainder?.text_color || config.global_text_color || 'inherit',
                unit_of_measurement: config.consumption_remainder?.unit_of_measurement || null,
                _inherit_unit_from: consumption[0]?.entity || null,
            },
            ...resolved,
            slanted_edge: config.slanted_edge ?? true,
            borders: config.borders ?? (resolved.layout === 'native'),

            show_names: config.show_names ?? true,
            hide_zero_values: config.hide_zero_values ?? true,
            rounding: config.rounding ?? 0,
            transparent: config.transparent ?? true,
            unit_of_measurement: config.unit_of_measurement,
            global_color: config.global_color || null,
            global_text_color: config.global_text_color || null,
            global_bg_opacity: config.global_bg_opacity || null,
            font_size_scale: config.font_size_scale || null,
            font_size_max: config.font_size_max || null,
            clip_labels: config.clip_labels ?? false,
            energy_date_selection: config.energy_date_selection ?? false,
            grid_options: config.grid_options || {},
        };
        this._updatedParsedConfig = null;

        // Re-subscribe if energy mode changed while connected
        if (this.isConnected) {
            this._unsubscribeEnergy();
            this._subscribeEnergy();
        }
    }


    //part of HASS card API
    static getConfigElement() {
        return document.createElement("hnl-flow-bars-card-editor");
    }

    //part of HASS card API
    static getStubConfig(hass) {
        if (!hass) {
            return {
                production: [{ entity: "sensor.solar_power" }],
                consumption: [{ entity: "sensor.house_power" }],
            };
        }

        // Find numeric sensor entities, preferring power/energy ones
        const states = Object.values(hass.states);
        const numeric = states.filter(
            (s) =>
                s.entity_id.startsWith("sensor.") &&
                !isNaN(parseFloat(s.state)) &&
                isFinite(s.state)
        );

        // Prefer power (W) sensors, then energy (kWh/Wh), then any numeric sensor
        const byPreference = (keyword) =>
            numeric.find(
                (s) =>
                    s.entity_id.includes(keyword) ||
                    (s.attributes.device_class || "") === keyword
            );

        const source =
            byPreference("solar") ||
            byPreference("power") ||
            numeric[0];
        const dest =
            numeric.find(
                (s) =>
                    s !== source &&
                    (s.entity_id.includes("consumption") ||
                        s.entity_id.includes("house") ||
                        s.entity_id.includes("load") ||
                        (s.attributes.device_class || "") === "power")
            ) ||
            numeric.find((s) => s !== source) ||
            source;

        return {
            production: [{ entity: source?.entity_id || "sensor.solar_power" }],
            consumption: [{ entity: dest?.entity_id || "sensor.house_power" }],
        };
    }

    //part of HASS card API — masonry view sizing (1 unit = 50px)
    getCardSize() {
        return this._rawConfig?.grid_options?.rows || 1;
    }

    //part of HASS card API — section view grid sizing
    getGridOptions() {
        return { columns: 12, min_columns: 3, rows: 1, min_rows: 1 };
    }

    //part of LitElement interface
    static get styles() {
        return [
            hnlFlowBarsCardScaffolding,
            hnlFlowBarsCardStyles,
        ];
    }
}

customElements.define("hnl-flow-bars-card", HnlFlowBarsCard);
