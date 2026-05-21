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
                --min-bar-width: min-content;
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

                display: block;
                height: 100%;
                min-height: var(--hnl-flow-bars-card-row-height, var(--ha-section-grid-row-height, 56px));
                font-size: var(--font-size, 0.8em);
                font-weight: 500;
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
            ha-card.transparent {
                background: none;
                border: none;
                box-shadow: none;
            }
            ha-card.transparent > .card-content {
				padding: 0;
			}
            ha-card.transparent {
				border-radius: 0;
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
                padding: 8px;
            }


            /* ═══ LAYOUT: Accolade (default) ═══ */
            hnl-flow-bars {
                display: grid;
                align-self: stretch;
                flex-basis: 100%;
                justify-items: stretch;
                gap: 0;
                grid-template-rows: 1fr var(--accolade-height, 5px) 1fr;
                border-radius: var(--border-radius, 8px);
                overflow: hidden;
                max-height: 100%;
                --hnl-flow-bars-font-size: clamp(
                    var(--hnl-flow-bars-font-size-min),
                    var(--hnl-flow-bars-font-size-fluid),
                    var(--hnl-flow-bars-font-size-max)
                );
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

            hnl-flow-bar-source-group,
            hnl-flow-bar-destination-group {
                font-size: var(--hnl-flow-bars-font-size);
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

            hnl-flow-bar-source-label,
            hnl-flow-bar-source-accolade,
            hnl-flow-bar-destination {
                display: flex;
                flex: var(--bar-grow, 0) 1 var(--bar-width, 0);
                transition: flex-basis 0.3s ease;
                --mdc-icon-size: min(1.25em, 1.2em);
                --label-padding: 0.15em 0.5em;
                --label-edge-padding: 0.7em;
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

            hnl-flow-bar-source-label {
                min-width: var(--min-bar-width);
            }
            hnl-flow-bar-source-accolade {
                min-width: var(--min-bar-width);
            }

            hnl-flow-bar-source-label:last-child,
            hnl-flow-bar-source-accolade:last-child,
            hnl-flow-bar-destination:last-child {
                --bar-grow: 1;
            }

            /* ═══ PRESENTATIONAL (shared) ═══ */
            hnl-flow-bar-destination {
                align-items: center;
                justify-content: center;
                padding: 0 1.5cqi;
                --adjusted-bg-color: oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity));
                --bg-gradient: linear-gradient(transparent, transparent);
                --bg-hatched: linear-gradient(transparent, transparent);
                background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color);
                color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
                overflow: hidden;
                min-width: var(--min-bar-width);
                box-shadow: inset 0 0 0 2px var(--background-color);
            }
            hnl-flow-bar-destination:last-child {
                border-radius: 0 max(0px, calc(var(--border-radius, 8px) - var(--accolade-height))) 0 0;
            }

            hnl-flow-bar-source-accolade {
                grid-row: 2;
                border: var(--accolade-border-width, var(--accolade-height, 2px)) solid var(--adjusted-bg-color, green);
                border-bottom: 0;
                --bg-hatched: linear-gradient(transparent, transparent);
                background: var(--bg-hatched), oklch(from var(--background-color) l c h / var(--accolade-bg-opacity));
                color: oklch(from var(--background-color) calc(l * .3) c h / 1);
                --adjusted-bg-color: oklch(from var(--background-color) calc(l) calc(c) h / 1);
                overflow: hidden;
                min-width: var(--border-radius, 8px);
            }

            hnl-flow-bar-source-accolade:last-child {
                border-radius: 0 var(--border-radius, 8px) 0 0;
            }
            hnl-flow-bar-source-accolades > :first-child:not(:only-child),
            hnl-flow-bar-source-accolade:nth-child(n+2):not(:last-child) {
              border-right: 0;
            }

            hnl-flow-bar-source-label > span,
            hnl-flow-bar-destination > span {
                display: flex;
                max-width: 100%;
                gap: 3px;
                padding: var(--label-padding, 0.2em 0.4em);
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                border-radius: min(0.4cqb,var(--border-radius, 8px));
                max-height: 100%;
                align-items: center;
            }

            hnl-flow-bar-destination > span {
                --span-bg-color: oklch(from var(--adjusted-bg-color) calc(l * 0.8) c h / 1);
                background-color: var(--span-bg-color);
                color: var(--text-color, oklch(from var(--span-bg-color) round(1.21 - l) 0 0 / 1));
                border-radius: clamp(5cqb, var(--border-radius, 8px), var(--ha-card-border-radius, 14px));
            }

            hnl-flow-bar-source-label {
                --slanted-edge: 20px;
                --correction: min(var(--accolade-height), calc(var(--ha-card-border-radius, 14px) / 2), var(--accolade-border-width));
                padding-right: calc(var(--border-radius, 8px) - var(--correction, 0px));
                margin-bottom: calc(-1 * var(--correction, 5px));
                justify-content: start;
                overflow: hidden;
            }

            hnl-flow-bar-source-label > span {
                --adjusted-bg-color: oklch(from var(--background-color) calc(l) calc(c) h / 1);
                --bg-gradient: linear-gradient(transparent, transparent);
                --bg-hatched: linear-gradient(transparent, transparent);
                align-items: center;
                background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color, rgba(0, 0, 0, 0.4));
                color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
                padding: 10cqb 1.5cqi;
                padding-right: calc((var(--label-edge-padding) / 2) + var(--slanted-edge, 20px));
                clip-path: polygon(0 0, calc(100% - var(--slanted-edge, 20px)) 0%, 100% 100%, 0% 100%);
                border-top-left-radius: var(--border-radius, 8px);
            }

            .source-value,
            .destination-value {
                display: flex;
                align-items: center;
                gap: inherit;
            }

            /* Entity names — hidden by default, shown when card is tall enough */
            .entity-name {
                display: none;
                opacity: 0.8;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding: 0 4px;
                max-width: 100%;
            }

            /* When a row is tall enough, show entity names. */
            @container bar-row (min-height: 2lh) {
                hnl-flow-bar-source-label > span {
                    display: grid;
                    gap: 2px;
                }

                hnl-flow-bar-source-label .entity-name {
                    display: block;
                    opacity: 0.85;
                    min-width: 0;
                }

                hnl-flow-bar-destination {
                    min-width: 0;
                }

                hnl-flow-bar-destination > span {
                    flex-direction: column;
                    gap: 2px;
                }

                hnl-flow-bar-destination .entity-name {
                    display: block;
                    color: inherit;
                    opacity: 0.85;
                }
            }

            /* When card is tall enough, scale up spacing */
            @container card (min-height: 12em) {
                hnl-flow-bars {
                    --accolade-height: 10px;
                }
            }

            /* Hide names when disabled */
            hnl-flow-bars.hide-names .entity-name {
                display: none !important;
            }

            /* ═══ TOGGLE: Animated — keyframes ═══ */
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

            /* ═══ TOGGLE: Gradient ═══ */
            hnl-flow-bars.gradient hnl-flow-bar-source-label > span {
                --bg-gradient: linear-gradient(
                    to left,
                    oklch(from var(--background-color) l c h / 1),
                    oklch(from var(--background-color) calc(l * 0.85) c calc(h - 30) / 1)
                );
            }
            hnl-flow-bars.gradient hnl-flow-bar-destination {
                --bg-gradient: linear-gradient(
                    to left,
                    oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity)),
                    oklch(from var(--background-color) calc(l * 0.85) calc(c * 1.2) calc(h - 30) / var(--destination-bg-opacity))
                );
            }

            /* ═══ LAYOUT: Native ═══ */
            hnl-flow-bars.native {
                grid-template-rows: 1fr 1fr;
                gap: 6px;
                padding: 0;
                border-radius: 0;
            }
			hnl-flow-bars.native.alternative {
				gap: 2px;
			}
            hnl-flow-bars.native hnl-flow-bar-source-group {
                display: flex;
                grid-row: 1;
            }
            hnl-flow-bars.native hnl-flow-bar-source-accolades {
                display: none;
            }
            hnl-flow-bars.native hnl-flow-bar-source-labels {
                flex: 1;
                align-items: stretch;
            }
            hnl-flow-bars.native hnl-flow-bar-destination-group {
                grid-row: 2;
            }

            /* Padding to prevent pill ends clipping against card border-radius
            ha-card.transparent .card-content:has(.native) {
                padding: 8px;
            } */

            /* Source labels — full bars, no slant */
            hnl-flow-bars.native hnl-flow-bar-source-label {
                --slanted-edge: 0px;
                padding-right: 0;
                margin-bottom: 0;
                --correction: 0px;
                --bg-gradient: linear-gradient(transparent, transparent);
                --bg-hatched: linear-gradient(transparent, transparent);
                background: var(--bg-hatched), var(--bg-gradient), oklch(from var(--background-color) l c h / var(--source-bg-opacity, 1));
                justify-content: center;
                border-radius: 0;
                box-shadow: inset 0 0 0 2px var(--background-color);
            }
            hnl-flow-bars.native hnl-flow-bar-source-label > span {
                clip-path: none;
                background: none;
                padding-right: calc(var(--font-size, 0.8em) * 0.5);
                border-radius: 0;
                border-top-left-radius: 0;
                justify-items: center;
            }
            /* Rounded ends only on outer edges */
            hnl-flow-bars.native hnl-flow-bar-source-label:first-child {
                border-radius: 9999px 0 0 9999px;
            }
            hnl-flow-bars.native hnl-flow-bar-source-label:last-child {
                border-radius: 0 9999px 9999px 0;
            }
            hnl-flow-bars.native hnl-flow-bar-source-label:only-child {
                border-radius: 9999px;
            }

            /* Destination bars — rounded ends only on outer edges, no inner span background */
            hnl-flow-bars.native hnl-flow-bar-destination {
                border-radius: 0;
            }
            hnl-flow-bars.native hnl-flow-bar-destination > span {
                --span-bg-color: var(--adjusted-bg-color);
                background: none;
                border-radius: 0;
            }
            hnl-flow-bars.native hnl-flow-bar-destination:first-child {
                border-radius: 9999px 0 0 9999px;
            }
            hnl-flow-bars.native hnl-flow-bar-destination:last-child {
                border-radius: 0 9999px 9999px 0;
            }
            hnl-flow-bars.native hnl-flow-bar-destination:only-child {
                border-radius: 9999px;
            }
			
			/* ═══ NATIVE THEME: Split corners ═══ */
            hnl-flow-bars.native.alternative hnl-flow-bar-source-label:first-child {
                border-radius: var(--ha-card-border-radius,var(--ha-border-radius-lg)) 0 0 0;
            }
            hnl-flow-bars.native.alternative hnl-flow-bar-source-label:last-child {
                border-radius: 0 var(--ha-card-border-radius,var(--ha-border-radius-lg)) 0 0;
            }
            hnl-flow-bars.native.alternative hnl-flow-bar-source-label:only-child {
                border-radius: var(--ha-card-border-radius,var(--ha-border-radius-lg)) var(--ha-card-border-radius,var(--ha-border-radius-lg)) 0 0;
            }
            hnl-flow-bars.native.alternative hnl-flow-bar-destination:first-child {
                border-radius: 0 0 0 var(--ha-card-border-radius,var(--ha-border-radius-lg));
            }
            hnl-flow-bars.native.alternative hnl-flow-bar-destination:last-child {
                border-radius: 0 0 var(--ha-card-border-radius,var(--ha-border-radius-lg)) 0;
            }
            hnl-flow-bars.native.alternative hnl-flow-bar-destination:only-child {
                border-radius: 0 0 var(--ha-card-border-radius,var(--ha-border-radius-lg)) var(--ha-card-border-radius,var(--ha-border-radius-lg));
            }

            /* ═══ NATIVE TOGGLE: Gradient ═══ */
            hnl-flow-bars.native.gradient hnl-flow-bar-source-label {
                --bg-gradient: linear-gradient(
                    to left,
                    oklch(from var(--background-color) l c h / var(--source-bg-opacity, 1)),
                    oklch(from var(--background-color) calc(l * 0.85) c calc(h - 30) / var(--source-bg-opacity, 1))
                );
            }
            hnl-flow-bars.native.gradient hnl-flow-bar-destination {
                --bg-gradient: linear-gradient(
                    to left,
                    oklch(from var(--background-color) l calc(c * 1.2) h / var(--destination-bg-opacity)),
                    oklch(from var(--background-color) calc(l * 0.85) calc(c * 1.2) calc(h - 30) / var(--destination-bg-opacity))
                );
            }
			
            /* ═══ NATIVE THEME: Minimal ═══ */
			hnl-flow-bars.native.minimal {
                gap: 2px;
			}
			hnl-flow-bars.native.minimal hnl-flow-bar-destination {
				box-shadow: inset 0 1px 0 1px var(--background-color);
				border-radius: 0 !important;
			}
			hnl-flow-bars.native.minimal hnl-flow-bar-source-label {
				box-shadow: inset 0 -1px 0 1px var(--background-color);
				border-radius: 0 !important;
			}
			
            /* ═══ NATIVE THEME: Contained ═══ */

            /* Since this theme uses a double height for the source row, we need to apply
            a fix that still hides the entity-name when there's no space for it */
            @container bar-row (max-height: 4lh) {
                hnl-flow-bars.native.contained hnl-flow-bar-source-label .entity-name {
                    display: none;
                }
            }
			hnl-flow-bars.native.contained hnl-flow-bar-source-group {
				grid-row: 1 / -1;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-destination-group {
				margin: min(1cqi, 4cqb);
				height: 50cqb;
				border-radius: 15cqb;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-source-label > span {
				height: 50cqb;
				padding-top: 5cqb;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-source-label:first-child {
				border-radius: 15cqb 0 0 15cqb;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-source-label:last-child {
				border-radius: 0 15cqb 15cqb 0;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-source-label:only-child {
				border-radius: 15cqb;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-destination:first-child {
				border-radius: 15cqb 0 0 15cqb;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-destination:last-child {
				border-radius: 0 15cqb 15cqb 0;
			}
			hnl-flow-bars.native.contained hnl-flow-bar-destination:only-child {
				border-radius: 15cqb;
			}
			
            /* ═══ LAYOUT MODIFIER: No borders ═══ */
            hnl-flow-bars.no-borders hnl-flow-bar-source-label,
            hnl-flow-bars.no-borders hnl-flow-bar-destination {
                box-shadow: none;
            }
			
            /* ═══ LAYOUT MODIFIER: No slanted edge ═══ */
            hnl-flow-bars.no-slant hnl-flow-bar-source-label {
                --slanted-edge: 0px;
                padding-right: 0;
            }
            hnl-flow-bars.no-slant:not(.native) hnl-flow-bar-source-label > span {
                clip-path: none;
                border-top-right-radius: var(--border-radius, 8px);
            }
			
            /* ═══ LAYOUT MODIFIER: Fill height (always on) ═══ */
            hnl-flow-bar-source-label {
                height: 100%;
            }
            hnl-flow-bar-source-label > span {
                align-self: stretch;
                justify-content: center;
            }

            /* ═══ TOGGLE: Hatched ═══ */
            hnl-flow-bar-destination.hatched > span {
                background-color: oklch(from var(--adjusted-bg-color) calc(l * 0.8) c h / 0.6);
            }

            hnl-flow-bars hnl-flow-bar-source-accolade.hatched,
            hnl-flow-bars hnl-flow-bar-destination.hatched,
            hnl-flow-bars hnl-flow-bar-source-label.hatched {
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
            hnl-flow-bars hnl-flow-bar-source-label.hatched > span,
            hnl-flow-bars hnl-flow-bar-source-label.hatched,
            hnl-flow-bars hnl-flow-bar-destination.hatched {
                background-size: 8.485px 8.485px, auto, auto;
            }
            /* 2-layer background-size: hatched, base (accolade has no gradient layer) */
            hnl-flow-bars hnl-flow-bar-source-accolade.hatched {
                background-size: 8.485px 8.485px, auto;
            }
            hnl-flow-bars hnl-flow-bar-source-label.hatched {
                --hatch-opacity: var(--source-bg-opacity);
            }
            hnl-flow-bars hnl-flow-bar-source-accolade.hatched {
                --hatch-opacity: var(--accolade-bg-opacity);
            }
            hnl-flow-bars hnl-flow-bar-destination.hatched {
                --hatch-opacity: var(--destination-bg-opacity);
            }

            /* 3-layer elements: destinations scroll right, source-labels scroll left */
            hnl-flow-bars.animated hnl-flow-bar-destination.hatched {
                animation: stripe-scroll-right-3 var(--animation-duration, 0.6s) linear infinite;
            }
            hnl-flow-bars.animated hnl-flow-bar-source-label.hatched {
                animation: stripe-scroll-left-3 var(--animation-duration, 0.6s) linear infinite;
            }
            /* Accolade source-label: animate the > span (where background lives) */
            hnl-flow-bars.animated hnl-flow-bar-source-label.hatched > span {
                animation: stripe-scroll-left-3 var(--animation-duration, 0.6s) linear infinite;
            }
            /* 2-layer elements: accolades scroll left */
            hnl-flow-bars.animated hnl-flow-bar-source-accolade.hatched {
                animation: stripe-scroll-left-2 var(--animation-duration, 0.6s) linear infinite;
            }

`;
