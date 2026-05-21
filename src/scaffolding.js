import { css } from 'lit';

export const hnlFlowBarsCardScaffolding = css`
    :host {
        --min-bar-width: min-content;

        display: block;
        height: 100%;
        min-height: var(--hnl-flow-bars-card-row-height, var(--ha-section-grid-row-height, 56px));
    }

    hnl-flow-bars *,
    hnl-flow-bars *::before,
    hnl-flow-bars *::after {
        box-sizing: border-box;
    }

    ha-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: inherit;
        overflow: hidden;
    }

    ha-card hnl-flow-bars {
        container-type: size;
        container-name: card;
    }

    .card-content {
        display: flex;
        flex: 1 1 auto;
        min-height: inherit;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    hnl-flow-bars {
        display: grid;
        align-self: stretch;
        flex-basis: 100%;
        justify-items: stretch;
        gap: 0;
        grid-template-rows: 1fr var(--accolade-height, 5px) 1fr;
        overflow: hidden;
        max-height: 100%;
    }

    hnl-flow-bar-source-group {
        display: grid;
        grid-column: 1;
        grid-row: 1 / -1;
        grid-template-rows: 1fr var(--accolade-height, 5px) 1fr;
        z-index: 2;
        overflow: hidden;
    }

    hnl-flow-bar-destination-group {
        display: flex;
        grid-column: 1;
        grid-row: 3;
        z-index: 3;
        overflow: hidden;
        gap: 0;
    }

    hnl-flow-bar-source-labels,
    hnl-flow-bar-source-accolades {
        display: flex;
        z-index: 2;
        gap: 0;
    }

    hnl-flow-bar-source-labels {
        grid-row: 1;
        align-items: flex-end;
        container-type: size;
    }

    hnl-flow-bar-source-accolades {
        grid-row: 2 / -1;
        z-index: 3;
    }

    hnl-flow-bar-source-labels,
    hnl-flow-bar-destination-group {
        container-type: size;
        container-name: bar-row;
    }

    hnl-flow-bar-source-group,
    hnl-flow-bar-source-accolades {
        container-type: size;
    }

    hnl-flow-bar-source-label,
    hnl-flow-bar-source-accolade,
    hnl-flow-bar-destination {
        display: flex;
        flex-basis: var(--bar-width, 0);
        flex-grow: var(--bar-grow, 0);
        flex-shrink: 1;
        max-width: var(--bar-width, auto);
        transition: flex-basis 0.3s ease;
    }

    hnl-flow-bar-source-label,
    hnl-flow-bar-destination {
        align-items: center;
        justify-content: center;
        min-width: min-content;
        overflow: hidden;
    }

    hnl-flow-bar-source-accolade {
        min-width: min-content;
        overflow: hidden;
    }

    hnl-flow-bar-source-label:last-child,
    hnl-flow-bar-source-accolade:last-child,
    hnl-flow-bar-destination:last-child {
        --bar-grow: 1;
    }

    .label-frame {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        max-height: 100%;
    }

    .source-value,
    .destination-value {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        white-space: nowrap;
        overflow: visible;
        min-width: min-content;
    }

    .entity-name {
        display: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 0;
        min-width: 100%;
        text-align: center;
    }

    @container bar-row (min-height: 2lh) {
        hnl-flow-bar-source-label .entity-name,
        hnl-flow-bar-destination .entity-name {
            display: block;
        }
    }

    ha-card.clip-labels hnl-flow-bar-source-label,
    ha-card.clip-labels hnl-flow-bar-destination {
        min-width: auto;
    }

    ha-card.clip-labels .source-value,
    ha-card.clip-labels .destination-value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;
