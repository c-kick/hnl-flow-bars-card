import { css } from 'lit';

export const hnlFlowBarsCardScaffolding = css`
    :host {
        --hnl-flow-bars-accolade-height: 8px;
        --hnl-flow-bars-font-size-scale: 1;
        --hnl-flow-bars-font-size-min: var(--ha-font-size-xs, 9px);
        --hnl-flow-bars-font-size-fluid: 22cqb;
        --hnl-flow-bars-font-size-max: 14px;
        --hnl-flow-bars-card-row-height: 56px;
        --hnl-flow-bars-card-grid-gap: 4px;

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

    /* ── ROOT GRID ───────────────────────────────────────────
       Three rows: source pulled tight at top, accolade band
       overlaps the seam, destination anchored at the bottom. */
    hnl-flow-bars {
        display: grid;
        align-self: stretch;
        flex-basis: 100%;
        justify-items: stretch;
        grid-template-rows: 1fr var(--hnl-flow-bars-accolade-height, 5px) 1fr;
        overflow: hidden;
        max-height: 100%;
    }

    /* ── GROUPS ──────────────────────────────────────────────
       Three sibling lanes. The accolade lane straddles the
       middle row to break the seam between source and
       destination. */
    hnl-flow-bars hnl-flow-bars-card-source-group {
        grid-column: 1;
        grid-row: 1 / 2;
    }
    hnl-flow-bars hnl-flow-bars-card-accolade-group {
        grid-column: 1;
        grid-row: 2 / 4;
    }
    hnl-flow-bars hnl-flow-bars-card-destination-group {
        grid-column: 1;
        grid-row: 3 / 4;
    }

    hnl-flow-bars hnl-flow-bars-card-source-group,
    hnl-flow-bars hnl-flow-bars-card-accolade-group,
    hnl-flow-bars hnl-flow-bars-card-destination-group {
        container-type: size;
        container-name: bar-row;
        display: flex;
        overflow: hidden;
    }

    /* Z-stack: source at the back, accolade band over the seam,
       destination on top so it stays visible when it overlaps
       (e.g. the "contained" theme floats its bar inside source). */
    hnl-flow-bars hnl-flow-bars-card-source-group { z-index: 1; }
    hnl-flow-bars hnl-flow-bars-card-accolade-group { z-index: 2; }
    hnl-flow-bars hnl-flow-bars-card-destination-group { z-index: 3; }

    /* ── SEGMENTS ────────────────────────────────────────────
       flex-basis + max-width pinned to --width-value keeps
       each segment honest to its proportion; flex-grow lets
       it claim leftover rounding slack. */
    hnl-flow-bars hnl-flow-bars-card-source-group hnl-flow-bars-card-source-label,
    hnl-flow-bars hnl-flow-bars-card-accolade-group hnl-flow-bars-card-source-accolade,
    hnl-flow-bars hnl-flow-bars-card-destination-group hnl-flow-bars-card-destination {
        flex-basis: var(--width-value, auto);
        flex-grow: 1;
        flex-shrink: 1;
        max-width: var(--width-value, auto);
        transition: flex-basis 0.3s ease;
    }

    hnl-flow-bars hnl-flow-bars-card-source-group hnl-flow-bars-card-source-label,
    hnl-flow-bars hnl-flow-bars-card-destination-group hnl-flow-bars-card-destination {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    hnl-flow-bars hnl-flow-bars-card-source-group hnl-flow-bars-card-source-label {
        justify-content: flex-start;
    }

    /* ── SEGMENT FLOOR ───────────────────────────────────────
       Default mode: a segment is never narrower than its
       value pill. min-content here resolves to the pill
       alone, because .entity-name sets width:0 and stays out
       of intrinsic sizing. */
    hnl-flow-bars-card-source-label,
    hnl-flow-bars-card-destination {
        min-width: min-content;
        overflow: hidden;
    }

    hnl-flow-bars-card-source-accolade {
        min-width: min-content;
        overflow: hidden;
    }

    /* ── FRAME ───────────────────────────────────────────────
       Inner column that fills the segment and centers its
       children on both axes. The clip context for the name. */
    hnl-flow-bars-card-source-label > div,
    hnl-flow-bars-card-destination-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        max-height: 100%;
    }

    /* ── PILL ────────────────────────────────────────────────
       Shrink-to-fit, hugs the value content. */
    .hnl-flow-bars-card-value-pill {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        white-space: nowrap;
    }

    /* ── VALUE ───────────────────────────────────────────────
       The floor-setter. Never clips in default mode. */
    .source-value,
    .destination-value {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        overflow: visible;
        min-width: min-content;
    }

    /* ── NAME ────────────────────────────────────────────────
       Fills the frame and ellipsis-clips. width:0 keeps it
       OUT of the segment's min-content floor; min-width:100%
       (indefinite during intrinsic sizing) fills the frame at
       layout time, then clips. */
    .entity-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 0;
        min-width: 100%;
        text-align: center;
    }

    /* ── CLIP MODE ───────────────────────────────────────────
       Drop the floor so the segment honours its raw
       proportion; let the value clip too. */
    ha-card.clip-labels hnl-flow-bars-card-source-label,
    ha-card.clip-labels hnl-flow-bars-card-destination {
        min-width: auto;
    }
    ha-card.clip-labels .source-value,
    ha-card.clip-labels .destination-value {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    ha-card.clip-labels .source-value > span,
    ha-card.clip-labels .destination-value > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    ha-card.clip-labels .source-value ha-icon,
    ha-card.clip-labels .destination-value ha-icon {
        overflow: hidden;
    }
    ha-card.clip-labels hnl-flow-bars-card-source-label > div {
        container-type: size;
        container-name: label-container;
        display: flex;
        width: 100%;
    }
    @container label-container (max-width: 12ex) {
        ha-card.clip-labels ha-icon {
            display: none;
        }
    }
`;
