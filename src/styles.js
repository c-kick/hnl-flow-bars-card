import { css } from 'lit';

export const hnlFlowBarsCardStyles = css`
    :host {
        --accolade-height: 8px;
        --accolade-border-width: 2px;
        --accolade-bg-opacity: 0.4;
        --destination-bg-opacity: 0.65;
        --border-radius: calc(var(--ha-card-border-radius, 14px) / 2);
        --font-size: min(calc(0.12em * var(--column-size)), var(--card-primary-font-size, 14px));
        --mdc-icon-size: min(calc(var(--font-size, 0.8em) + 0.5em), 1.2em);
        --label-edge-padding: calc(var(--font-size, 0.8em) * .7);
        --label-padding: calc(var(--font-size, 0.8em) * 0.15) calc(var(--font-size, 0.8em) * 0.5);
        --hnl-flow-bars-font-size-scale: 1;
        --hnl-flow-bars-font-size-min: var(--ha-font-size-xs, 9px);
        --hnl-flow-bars-font-size-fluid: 22cqb;
        --hnl-flow-bars-font-size-max: 14px;
        --hnl-flow-bars-card-row-height: 56px;

        --hnl-flow-bars-color-default: hsl(205, 90%, 55%);

        /* Base colors */
        --hnl-flow-bars-color-production: #ffd407;
        --hnl-flow-bars-color-production-0: oklch(from var(--hnl-flow-bars-color-production) l c h);
        --hnl-flow-bars-color-production-1: oklch(from var(--hnl-flow-bars-color-production) calc(l * 0.92) c calc(h - 15));
        --hnl-flow-bars-color-production-2: oklch(from var(--hnl-flow-bars-color-production) calc(l * 1.08) c calc(h + 15));
        --hnl-flow-bars-color-production-3: oklch(from var(--hnl-flow-bars-color-production) calc(l * 0.85) c calc(h - 30));

        --hnl-flow-bars-color-consumption: #8b58bf;
        --hnl-flow-bars-color-consumption-0: oklch(from var(--hnl-flow-bars-color-consumption) l c h);
        --hnl-flow-bars-color-consumption-1: oklch(from var(--hnl-flow-bars-color-consumption) calc(l * 0.92) c calc(h - 15));
        --hnl-flow-bars-color-consumption-2: oklch(from var(--hnl-flow-bars-color-consumption) calc(l * 1.08) c calc(h + 15));
        --hnl-flow-bars-color-consumption-3: oklch(from var(--hnl-flow-bars-color-consumption) calc(l * 0.85) c calc(h - 30));

        /* Remainder / shortfall+surplus colors */
        --hnl-flow-bars-color-shortfall: #ce513a;
        --hnl-flow-bars-color-surplus: #3c9940;

        font-size: var(--font-size, 0.8em);
        font-weight: 500;
    }

    /* ═══ CARD CHROME ════════════════════════════════════════ */
    ha-card.transparent {
        background: none;
        border: none;
        box-shadow: none;
        border-radius: 0;
    }
    ha-card.transparent > .card-content {
        padding: 0;
    }

    .card-content {
        padding: 8px;
    }

    /* ═══ ROOT (visual) ══════════════════════════════════════ */
    hnl-flow-bars {
        border-radius: var(--border-radius, 8px);
        --hnl-flow-bars-font-size: clamp(
            var(--hnl-flow-bars-font-size-min),
            var(--hnl-flow-bars-font-size-fluid),
            var(--hnl-flow-bars-font-size-max)
        );
    }

    hnl-flow-bars hnl-flow-bars-card-source-group,
    hnl-flow-bars hnl-flow-bars-card-destination-group {
        font-size: var(--hnl-flow-bars-font-size);
    }

    /* Z-stack: accolade band paints above the seam; destination
       sits above source so the "contained" theme can float its
       bar inside the source area. */
    hnl-flow-bars hnl-flow-bars-card-source-group { z-index: 1; }
    hnl-flow-bars hnl-flow-bars-card-destination-group { z-index: 2; }
    hnl-flow-bars hnl-flow-bars-card-accolade-group { z-index: 3; }

    /* When the card has vertical headroom, give the accolade more presence */
    @container card (min-height: 12em) {
        hnl-flow-bars {
            --accolade-height: 10px;
        }
    }

    /* ═══ SEGMENT TOKENS ═════════════════════════════════════ */
    hnl-flow-bars-card-source-label,
    hnl-flow-bars-card-source-accolade,
    hnl-flow-bars-card-destination {
        --mdc-icon-size: min(1.25em, 1.2em);
        --label-padding: 0.15em 0.5em;
        --label-edge-padding: 0.7em;
    }

    /* Frames stretch vertically so theme backgrounds fill the segment */
    hnl-flow-bars-card-source-label > div,
    hnl-flow-bars-card-destination-label {
        align-self: stretch;
        height: 100%;
    }

    /* ═══ DEFAULT (Accolade) — SOURCE LABEL ══════════════════
       The frame fills the segment and carries the colored
       label-box: slanted right edge, top-left rounding, layered
       gradient/hatch/base background. */
    hnl-flow-bars-card-source-label {
        --slanted-edge: 20px;
        --correction: min(var(--accolade-height), calc(var(--ha-card-border-radius, 14px) / 2), var(--accolade-border-width));
        padding-right: calc(var(--border-radius, 8px) - var(--correction, 0px));
        margin-bottom: calc(-1 * var(--correction, 5px));
    }

    hnl-flow-bars-card-source-label > div {
        --adjusted-bg-color: oklch(from var(--background-color) calc(l) calc(c) h / 1);
        --bg-gradient: linear-gradient(transparent, transparent);
        --bg-hatched: linear-gradient(transparent, transparent);
        background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color, rgba(0, 0, 0, 0.4));
        color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
        padding: 10cqb 1.5cqi;
        padding-right: calc((var(--label-edge-padding) / 2) + var(--slanted-edge, 20px));
        clip-path: polygon(0 0, calc(100% - var(--slanted-edge, 20px)) 0%, 100% 100%, 0% 100%);
        border-top-left-radius: var(--border-radius, 8px);
        gap: 2px;
    }

    /* ═══ DEFAULT (Accolade) — ACCOLADE BAND ═════════════════ */
    hnl-flow-bars-card-source-accolade {
        border: var(--accolade-border-width, var(--accolade-height, 2px)) solid var(--adjusted-bg-color, green);
        border-bottom: 0;
        --bg-hatched: linear-gradient(transparent, transparent);
        background: var(--bg-hatched), oklch(from var(--background-color) l c h / var(--accolade-bg-opacity));
        color: oklch(from var(--background-color) calc(l * .3) c h / 1);
        --adjusted-bg-color: oklch(from var(--background-color) calc(l) calc(c) h / 1);
        min-width: var(--border-radius, 8px);
    }

    hnl-flow-bars-card-source-accolade:last-child {
        border-radius: 0 var(--border-radius, 8px) 0 0;
    }
    hnl-flow-bars-card-accolade-group > hnl-flow-bars-card-source-accolade:first-child:not(:only-child),
    hnl-flow-bars-card-source-accolade:nth-child(n+2):not(:last-child) {
        border-right: 0;
    }

    /* ═══ DEFAULT (Accolade) — DESTINATION ═══════════════════
       Segment carries the lighter background and the
       segment-border outline; the destination-label inside
       carries the darker chip + rounding. */
    hnl-flow-bars-card-destination {
        padding: 0 1.5cqi;
        --adjusted-bg-color: oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity));
        --bg-gradient: linear-gradient(transparent, transparent);
        --bg-hatched: linear-gradient(transparent, transparent);
        background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color);
        color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
        box-shadow: inset 0 0 0 2px var(--background-color);
    }
    hnl-flow-bars-card-destination:last-child {
        border-radius: 0 max(0px, calc(var(--border-radius, 8px) - var(--accolade-height))) 0 0;
    }

    hnl-flow-bars-card-destination-label {
        --span-bg-color: oklch(from var(--adjusted-bg-color) calc(l * 0.8) c h / 1);
        background-color: var(--span-bg-color);
        color: var(--text-color, oklch(from var(--span-bg-color) round(1.21 - l) 0 0 / 1));
        border-radius: clamp(5cqb, var(--border-radius, 8px), var(--ha-card-border-radius, 14px));
        padding: var(--label-padding, 0.2em 0.4em);
        gap: 2px;
    }

    /* ═══ PILL + VALUE + NAME (visual layer) ═════════════════ */
    .hnl-flow-bars-card-value-pill {
        gap: 3px;
    }

    .source-value,
    .destination-value {
        gap: 3px;
    }

    .entity-name {
        opacity: 0.85;
        padding: 0 4px;
    }

    /* Per-user opt-out */
    hnl-flow-bars.hide-names .entity-name {
        display: none;
    }

    /* When a row is too short to fit a second line, hide names */
    @container bar-row (max-height: 2lh) {
        .entity-name {
            display: none;
        }
    }

    /* ═══ TOGGLE: Animated — keyframes ═══════════════════════ */
    /* 3-layer: gradient (static), hatched (animated), base (static) */
    @keyframes stripe-scroll-left-3 {
        0% { background-position: 0 0, 0 0, 0 0; }
        100% { background-position: -8.485px 0, 0 0, 0 0; }
    }
    @keyframes stripe-scroll-right-3 {
        0% { background-position: 0 0, 0 0, 0 0; }
        100% { background-position: 8.485px 0, 0 0, 0 0; }
    }
    /* 2-layer: hatched (animated), base (static) — for accolades */
    @keyframes stripe-scroll-left-2 {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: -8.485px 0, 0 0; }
    }
    @keyframes stripe-scroll-right-2 {
        0% { background-position: 0 0, 0 0; }
        100% { background-position: 8.485px 0, 0 0; }
    }

    /* ═══ TOGGLE: Gradient ═══════════════════════════════════ */
    hnl-flow-bars.gradient hnl-flow-bars-card-source-label > div {
        --bg-gradient: linear-gradient(
            to left,
            oklch(from var(--background-color) l c h / 1),
            oklch(from var(--background-color) calc(l * 0.85) c calc(h - 30) / 1)
        );
    }
    hnl-flow-bars.gradient hnl-flow-bars-card-destination {
        --bg-gradient: linear-gradient(
            to left,
            oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity)),
            oklch(from var(--background-color) calc(l * 0.85) calc(c * 1.2) calc(h - 30) / var(--destination-bg-opacity))
        );
    }

    /* ═══ LAYOUT: Native ═════════════════════════════════════
       Drop the accolade band, hand both rows over to source
       and destination, and turn each segment into a pill bar. */
    hnl-flow-bars.native {
        grid-template-rows: 1fr 1fr;
        gap: 6px;
        padding: 0;
        border-radius: 0;
    }
    hnl-flow-bars.native hnl-flow-bars-card-accolade-group {
        display: none;
    }
    hnl-flow-bars.native hnl-flow-bars-card-source-group {
        grid-row: 1;
        align-items: stretch;
    }
    hnl-flow-bars.native hnl-flow-bars-card-destination-group {
        grid-row: 2;
    }

    /* Source labels — full pill, no slant */
    hnl-flow-bars.native hnl-flow-bars-card-source-label {
        --slanted-edge: 0px;
        padding-right: 0;
        margin-bottom: 0;
        --correction: 0px;
        --bg-gradient: linear-gradient(transparent, transparent);
        --bg-hatched: linear-gradient(transparent, transparent);
        background: var(--bg-hatched), var(--bg-gradient), oklch(from var(--background-color) l c h / var(--source-bg-opacity, 1));
        box-shadow: inset 0 0 0 2px var(--background-color);
    }
    hnl-flow-bars.native hnl-flow-bars-card-source-label > div {
        clip-path: none;
        background: none;
        padding: 0 calc(var(--font-size, 0.8em) * 0.5);
        border-radius: 0;
        border-top-left-radius: 0;
    }
    /* Rounded ends only on outer edges */
    hnl-flow-bars.native hnl-flow-bars-card-source-label:first-child {
        border-radius: 9999px 0 0 9999px;
    }
    hnl-flow-bars.native hnl-flow-bars-card-source-label:last-child {
        border-radius: 0 9999px 9999px 0;
    }
    hnl-flow-bars.native hnl-flow-bars-card-source-label:only-child {
        border-radius: 9999px;
    }

    /* Destination bars — rounded ends on outer edges, no inner chip */
    hnl-flow-bars.native hnl-flow-bars-card-destination {
        border-radius: 0;
    }
    hnl-flow-bars.native hnl-flow-bars-card-destination-label {
        --span-bg-color: var(--adjusted-bg-color);
        background: none;
        border-radius: 0;
        padding: 0;
    }
    hnl-flow-bars.native hnl-flow-bars-card-destination:first-child {
        border-radius: 9999px 0 0 9999px;
    }
    hnl-flow-bars.native hnl-flow-bars-card-destination:last-child {
        border-radius: 0 9999px 9999px 0;
    }
    hnl-flow-bars.native hnl-flow-bars-card-destination:only-child {
        border-radius: 9999px;
    }

    /* ═══ NATIVE THEME: Split-pill (alternative) ═════════════
       Square inner edges, HA card-radius on the outer corners. */
    hnl-flow-bars.native.alternative {
        gap: 2px;
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-source-label:first-child {
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg)) 0 0 0;
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-source-label:last-child {
        border-radius: 0 var(--ha-card-border-radius, var(--ha-border-radius-lg)) 0 0;
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-source-label:only-child {
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg)) var(--ha-card-border-radius, var(--ha-border-radius-lg)) 0 0;
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-destination:first-child {
        border-radius: 0 0 0 var(--ha-card-border-radius, var(--ha-border-radius-lg));
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-destination:last-child {
        border-radius: 0 0 var(--ha-card-border-radius, var(--ha-border-radius-lg)) 0;
    }
    hnl-flow-bars.native.alternative hnl-flow-bars-card-destination:only-child {
        border-radius: 0 0 var(--ha-card-border-radius, var(--ha-border-radius-lg)) var(--ha-card-border-radius, var(--ha-border-radius-lg));
    }

    /* ═══ NATIVE TOGGLE: Gradient (override default gradient) ═ */
    hnl-flow-bars.native.gradient hnl-flow-bars-card-source-label {
        --bg-gradient: linear-gradient(
            to left,
            oklch(from var(--background-color) l c h / var(--source-bg-opacity, 1)),
            oklch(from var(--background-color) calc(l * 0.85) c calc(h - 30) / var(--source-bg-opacity, 1))
        );
    }
    hnl-flow-bars.native.gradient hnl-flow-bars-card-source-label > div {
        background: none;
    }
    hnl-flow-bars.native.gradient hnl-flow-bars-card-destination {
        --bg-gradient: linear-gradient(
            to left,
            oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity)),
            oklch(from var(--background-color) calc(l * 0.85) calc(c * 1.2) calc(h - 30) / var(--destination-bg-opacity))
        );
    }

    /* ═══ NATIVE THEME: Minimal ══════════════════════════════
       Thin outlined bars, hard corners, tight gap. */
    hnl-flow-bars.native.minimal {
        gap: 2px;
    }
    hnl-flow-bars.native.minimal hnl-flow-bars-card-destination {
        box-shadow: inset 0 1px 0 1px var(--background-color);
        border-radius: 0;
    }
    hnl-flow-bars.native.minimal hnl-flow-bars-card-source-label {
        box-shadow: inset 0 -1px 0 1px var(--background-color);
        border-radius: 0;
    }

    /* ═══ NATIVE THEME: Contained ════════════════════════════
       Source fills the card; destination floats inside as a
       smaller rounded bar. Hide the name on short rows. */
    hnl-flow-bars.native.contained hnl-flow-bars-card-source-group {
        grid-row: 1 / -1;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-destination-group {
        margin: min(1cqi, 4cqb);
        height: 50cqb;
        border-radius: 15cqb;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-source-label > div {
        height: 50cqb;
        padding-top: 5cqb;
    }
    @container bar-row (max-height: 4lh) {
        hnl-flow-bars.native.contained hnl-flow-bars-card-source-label .entity-name {
            display: none;
        }
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-source-label:first-child {
        border-radius: 15cqb 0 0 15cqb;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-source-label:last-child {
        border-radius: 0 15cqb 15cqb 0;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-source-label:only-child {
        border-radius: 15cqb;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-destination:first-child {
        border-radius: 15cqb 0 0 15cqb;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-destination:last-child {
        border-radius: 0 15cqb 15cqb 0;
    }
    hnl-flow-bars.native.contained hnl-flow-bars-card-destination:only-child {
        border-radius: 15cqb;
    }

    /* ═══ LAYOUT MODIFIER: No borders ════════════════════════ */
    hnl-flow-bars.no-borders hnl-flow-bars-card-source-label,
    hnl-flow-bars.no-borders hnl-flow-bars-card-destination {
        box-shadow: none;
    }

    /* ═══ LAYOUT MODIFIER: No slanted edge ═══════════════════ */
    hnl-flow-bars.no-slant hnl-flow-bars-card-source-label {
        --slanted-edge: 0px;
        padding-right: 0;
    }
    hnl-flow-bars.no-slant:not(.native) hnl-flow-bars-card-source-label > div {
        clip-path: none;
        border-top-right-radius: var(--border-radius, 8px);
    }

    /* ═══ TOGGLE: Hatched ════════════════════════════════════ */
    hnl-flow-bars-card-destination.hatched > hnl-flow-bars-card-destination-label {
        background-color: oklch(from var(--adjusted-bg-color) calc(l * 0.8) c h / 0.6);
    }

    hnl-flow-bars hnl-flow-bars-card-source-accolade.hatched,
    hnl-flow-bars hnl-flow-bars-card-destination.hatched,
    hnl-flow-bars hnl-flow-bars-card-source-label.hatched {
        --hatch-opacity: var(--source-bg-opacity);
        --bg-hatched: repeating-linear-gradient(
            -45deg,
            oklch(from var(--background-color) calc(l * 1.1) c h / var(--hatch-opacity, 1)) 0px,
            oklch(from var(--background-color) calc(l * 1.1) c h / var(--hatch-opacity, 1)) 3px,
            transparent 3px,
            transparent 6px
        );
    }
    /* 3-layer background-size: gradient, hatched, base */
    hnl-flow-bars hnl-flow-bars-card-source-label.hatched > div,
    hnl-flow-bars hnl-flow-bars-card-source-label.hatched,
    hnl-flow-bars hnl-flow-bars-card-destination.hatched {
        background-size: 8.485px 8.485px, auto, auto;
    }
    /* 2-layer background-size: hatched, base (accolade has no gradient layer) */
    hnl-flow-bars hnl-flow-bars-card-source-accolade.hatched {
        background-size: 8.485px 8.485px, auto;
    }
    hnl-flow-bars hnl-flow-bars-card-source-accolade.hatched {
        --hatch-opacity: var(--accolade-bg-opacity);
    }
    hnl-flow-bars hnl-flow-bars-card-destination.hatched {
        --hatch-opacity: var(--destination-bg-opacity);
    }

    /* 3-layer elements: destinations scroll right, source-labels scroll left */
    hnl-flow-bars.animated hnl-flow-bars-card-destination.hatched {
        animation: stripe-scroll-right-3 var(--animation-duration, 0.6s) linear infinite;
    }
    hnl-flow-bars.animated hnl-flow-bars-card-source-label.hatched {
        animation: stripe-scroll-left-3 var(--animation-duration, 0.6s) linear infinite;
    }
    /* Accolade source-label: animate the frame (where background lives) */
    hnl-flow-bars.animated hnl-flow-bars-card-source-label.hatched > div {
        animation: stripe-scroll-left-3 var(--animation-duration, 0.6s) linear infinite;
    }
    /* 2-layer elements: accolades scroll left */
    hnl-flow-bars.animated hnl-flow-bars-card-source-accolade.hatched {
        animation: stripe-scroll-left-2 var(--animation-duration, 0.6s) linear infinite;
    }
`;
