# CSS Scaffolding And Style Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the card CSS into layout scaffolding and visual styling modules, using `flexbox-model.html` as the blueprint for the card's base flow-bar layout behavior.

**Architecture:** `src/scaffolding.js` owns structural layout, sizing, flex/grid behavior, intrinsic label fitting, overflow behavior, and normal-flow card sizing. `src/styles.js` owns visual appearance: colors, backgrounds, hatching, gradients, borders, radii, typography, spacing skin, shadows, transitions, animations, and theme modifiers. `src/hnl-flow-bars-card.js` imports both style modules and exposes them through Lit's `static get styles()`.

**Tech Stack:** Lit 3 `css` tagged templates, native custom elements, Rollup, Vitest, plain CSS custom properties.

---

## Source Blueprint Rules

Use `flexbox-model.html` for the structural model only:

- Keep: grid row scaffolding, source/accolade/destination group placement, flex-basis behavior from per-bar width variables, label/value intrinsic sizing rules, entity-name ellipsis model, and clip-mode versus fit-label mode concept.
- Ignore completely: the block marked `PRESENTATIONAL DEBUGGING STYLES - IGNORE THIS BLOCK ENTIRELY`.
- Do not copy from the ignored block: fixed demo dimensions, outlines, debug colors, demo backgrounds, demo fonts, demo margins, or visual pill colors.
- Do not rename production elements to the prototype's verbose element names. Map blueprint concepts onto existing elements:
  - `hnl-flow-bars-card` prototype root maps to production `hnl-flow-bars`.
  - `hnl-flow-bars-card-source-group` maps to `hnl-flow-bar-source-group`.
  - `hnl-flow-bars-card-accolade-group` maps to `hnl-flow-bar-source-accolades`.
  - `hnl-flow-bars-card-destination-group` maps to `hnl-flow-bar-destination-group`.
  - `hnl-flow-bars-card-source-label` maps to `hnl-flow-bar-source-label`.
  - `hnl-flow-bars-card-source-accolade` maps to `hnl-flow-bar-source-accolade`.
  - `hnl-flow-bars-card-destination` maps to `hnl-flow-bar-destination`.
  - `.hnl-flow-bars-card-value-pill` maps to `.source-value` and `.destination-value` or a new shared `.value-pill` only if the render markup is deliberately changed in a later task.

## File Structure

- Create `src/scaffolding.js`: Lit CSS module containing the card's structural CSS. It must be visually boring and mostly color-free. It may define layout-related custom property defaults.
- Create `src/styles.js`: Lit CSS module containing visual defaults, colors, decorative backgrounds, typography, hatching, gradients, borders, radii, shadows, and theme/toggle styling.
- Modify `src/hnl-flow-bars-card.js`: remove `css` import from `lit`, import `hnlFlowBarsCardScaffolding` and `hnlFlowBarsCardStyles`, and return both from `static get styles()`.
- Modify `test/card-sizing.test.js`: inspect `src/scaffolding.js` instead of the monolithic card file.
- Add `test/css-modules.test.js`: assert module boundaries by checking for expected selectors and absence of presentational debug CSS.
- Modify `README.md`: document that project CSS is split into scaffolding and style modules for maintainers.

## Boundary Definitions

`src/scaffolding.js` should contain:

- `:host` display, height, min-height, and normal-flow sizing.
- `ha-card` and `.card-content` structural layout.
- `hnl-flow-bars` base grid/flex layout.
- source/accolade/destination group placement.
- segment flex sizing: `flex-basis`, `flex-grow`, `flex-shrink`, `max-width`.
- label intrinsic sizing: fit-label mode and clip mode.
- entity-name ellipsis behavior.
- container queries that decide whether entity names are structurally shown.
- layout structural variants for `native`, `contained`, and hidden names, if they affect row/grid/flex geometry.

`src/styles.js` should contain:

- default colors and generated palette variables.
- typography values and font-size clamp variables.
- background, hatching, gradient, animation, and opacity rules.
- border, border-radius, box-shadow, padding that is visual rather than structural.
- transparent card skin.
- theme visual modifiers: `minimal`, `split-pill`/`alternative`, `contained` visual details.
- no debug outlines or prototype demo colors.

When a rule mixes both concerns, split it. Example:

```css
/* scaffolding.js */
hnl-flow-bar-destination {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* styles.js */
hnl-flow-bar-destination {
    background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color);
    color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
    box-shadow: inset 0 0 0 2px var(--background-color);
}
```

---

### Task 1: Add CSS Module Boundary Tests

**Files:**
- Create: `test/css-modules.test.js`
- Modify: none

- [ ] **Step 1: Write failing tests for the future CSS module boundaries**

Create `test/css-modules.test.js` with:

```js
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const scaffoldingPath = new URL('../src/scaffolding.js', import.meta.url);
const stylesPath = new URL('../src/styles.js', import.meta.url);

describe('css module split', () => {
    it('has separate scaffolding and visual style modules', () => {
        expect(existsSync(scaffoldingPath)).toBe(true);
        expect(existsSync(stylesPath)).toBe(true);
    });

    it('keeps presentational debugging css out of production modules', () => {
        const sources = [
            readFileSync(scaffoldingPath, 'utf8'),
            readFileSync(stylesPath, 'utf8'),
        ].join('\n');

        expect(sources).not.toContain('PRESENTATIONAL DEBUGGING STYLES');
        expect(sources).not.toContain('outline: 1px solid blue');
        expect(sources).not.toContain('outline: 1px solid green');
        expect(sources).not.toContain('width: 600px');
        expect(sources).not.toContain('height: 150px');
        expect(sources).not.toContain('margin: 0 auto');
    });

    it('places core layout selectors in scaffolding', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('export const hnlFlowBarsCardScaffolding');
        expect(source).toContain('hnl-flow-bars');
        expect(source).toContain('hnl-flow-bar-source-group');
        expect(source).toContain('hnl-flow-bar-source-accolades');
        expect(source).toContain('hnl-flow-bar-destination-group');
        expect(source).toContain('min-width: min-content');
        expect(source).toContain('text-overflow: ellipsis');
    });

    it('places visual selectors in styles', () => {
        const source = readFileSync(stylesPath, 'utf8');

        expect(source).toContain('export const hnlFlowBarsCardStyles');
        expect(source).toContain('--hnl-flow-bars-color-production');
        expect(source).toContain('--hnl-flow-bars-color-consumption');
        expect(source).toContain('@keyframes stripe-scroll-left-3');
        expect(source).toContain('repeating-linear-gradient');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- test/css-modules.test.js
```

Expected: FAIL because `src/scaffolding.js` and `src/styles.js` do not exist.

- [ ] **Step 3: Commit the failing tests**

Do not commit failing tests to a shared branch. If working locally with task commits, skip this commit and include these tests in the first passing implementation commit.

---

### Task 2: Extract Existing CSS Into Modules Without Behavior Changes

**Files:**
- Create: `src/scaffolding.js`
- Create: `src/styles.js`
- Modify: `src/hnl-flow-bars-card.js`
- Modify: `test/card-sizing.test.js`
- Test: `test/css-modules.test.js`
- Test: `test/card-sizing.test.js`

- [ ] **Step 1: Create initial module files**

Create `src/scaffolding.js`:

```js
import { css } from 'lit';

export const hnlFlowBarsCardScaffolding = css`
    :host {
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

    hnl-flow-bar-source-label,
    hnl-flow-bar-source-accolade,
    hnl-flow-bar-destination {
        display: flex;
        flex: var(--bar-grow, 0) 1 var(--bar-width, 0);
        transition: flex-basis 0.3s ease;
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
        min-width: var(--min-bar-width);
    }

    hnl-flow-bar-source-label:last-child,
    hnl-flow-bar-source-accolade:last-child,
    hnl-flow-bar-destination:last-child {
        --bar-grow: 1;
    }

    hnl-flow-bar-source-label > span,
    hnl-flow-bar-destination > span {
        display: flex;
        max-width: 100%;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-height: 100%;
        align-items: center;
    }

    .source-value,
    .destination-value {
        display: flex;
        align-items: center;
        gap: inherit;
    }

    .entity-name {
        display: none;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
    }

    @container bar-row (min-height: 2lh) {
        hnl-flow-bar-source-label > span {
            display: grid;
        }

        hnl-flow-bar-source-label .entity-name {
            display: block;
            min-width: 0;
        }

        hnl-flow-bar-destination {
            min-width: 0;
        }

        hnl-flow-bar-destination > span {
            flex-direction: column;
        }

        hnl-flow-bar-destination .entity-name {
            display: block;
        }
    }
`;
```

Create `src/styles.js` by moving the remaining visual CSS out of the current `static get styles()` block. At this task, preserve all declarations not already moved to `src/scaffolding.js`, including current variable names. The file must start with:

```js
import { css } from 'lit';

export const hnlFlowBarsCardStyles = css`
```

And it must end with:

```js
`;
```

- [ ] **Step 2: Update the card to import both modules**

Modify the top of `src/hnl-flow-bars-card.js`:

```js
import { LitElement, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { applyEntityValueOptions, applyFontSizeOptions, computeEntityIcon, resolveLayoutAndTheme } from './utils.js';
import {
    CARD_VERSION, CARD_NAME, CARD_DESCRIPTION,
} from './const.js';
import { subscribeEnergyDateSelection, fetchStatistics } from './energy.js';
import { hnlFlowBarsCardScaffolding } from './scaffolding.js';
import { hnlFlowBarsCardStyles } from './styles.js';
import './editor/hnl-flow-bars-card-editor.js';
```

Replace `static get styles()` with:

```js
    //part of LitElement interface
    static get styles() {
        return [
            hnlFlowBarsCardScaffolding,
            hnlFlowBarsCardStyles,
        ];
    }
```

- [ ] **Step 3: Update sizing test source**

Modify `test/card-sizing.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/scaffolding.js', import.meta.url), 'utf8');

describe('card sizing css contract', () => {
    it('keeps rendered content in normal flow so masonry can derive height', () => {
        const cardContentRule = source.match(/\n\s{4}\.card-content\s*\{[^}]+\}/)?.[0];

        expect(cardContentRule).toBeDefined();
        expect(cardContentRule).not.toContain('position: absolute;');
        expect(cardContentRule).not.toContain('inset: 0;');
        expect(cardContentRule).toContain('min-height: inherit;');
    });
});
```

- [ ] **Step 4: Run targeted tests**

Run:

```bash
npm test -- test/css-modules.test.js test/card-sizing.test.js
```

Expected: PASS.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS, Rollup creates `dist/hnl-flow-bars-card.js`.

- [ ] **Step 6: Commit**

```bash
git add src/scaffolding.js src/styles.js src/hnl-flow-bars-card.js test/css-modules.test.js test/card-sizing.test.js
git commit -m "refactor: split card css modules"
```

---

### Task 3: Port The Blueprint Label-Fitting Scaffolding

**Files:**
- Modify: `src/scaffolding.js`
- Modify: `src/styles.js`
- Modify: `src/hnl-flow-bars-card.js`
- Test: `test/css-modules.test.js`

- [ ] **Step 1: Add tests for blueprint-derived scaffolding**

Extend `test/css-modules.test.js` with:

```js
    it('implements blueprint label fitting without presentational demo css', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('flex-basis: var(--bar-width, 0)');
        expect(source).toContain('max-width: var(--bar-width, auto)');
        expect(source).toContain('min-width: min-content');
        expect(source).toContain('width: 0');
        expect(source).toContain('min-width: 100%');
        expect(source).toContain('ha-card.clip-labels hnl-flow-bar-source-label');
        expect(source).toContain('ha-card.clip-labels hnl-flow-bar-destination');
        expect(source).not.toContain('outline-offset');
        expect(source).not.toContain('background-color: #F006');
    });
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
npm test -- test/css-modules.test.js
```

Expected: FAIL because `src/scaffolding.js` does not yet contain the blueprint label-fitting model.

- [ ] **Step 3: Update source/destination markup with a stable frame class**

Modify `_renderSourceLabel` in `src/hnl-flow-bars-card.js` so the direct child wrapper has a class:

```js
    _renderSourceLabel(ent) {
        return html`<hnl-flow-bar-source-label title="${ent.name}: ${this._roundOff(ent.value)} ${this._parsedConfig.unit_of_measurement || ent.unit_of_measurement || ''}" style="--background-color:${ent.color};--text-color:${ent.text_color};--bar-width:${ent.width}%;--source-bg-opacity:${ent.bg_opacity};--animation-duration:${this._animDuration(ent.width)};cursor:pointer;" @click=${() => this._handleAction(ent.entity_id)}><span class="label-frame">
            <span class="source-value"><ha-icon icon="${ent.icon || 'mdi:eye'}"></ha-icon>
            <span>${this._roundOff(ent.value)} ${this._parsedConfig.unit_of_measurement || ent.unit_of_measurement}</span></span>
            <span class="entity-name">${ent.name}</span>
          </span></hnl-flow-bar-source-label>`;
    }
```

Modify `_renderDestination` the same way:

```js
    _renderDestination(ent) {
        return html`<hnl-flow-bar-destination title="${ent.name}: ${this._roundOff(ent.value)} ${this._parsedConfig.unit_of_measurement || ent.unit_of_measurement || ''}" style="--background-color:${ent.color};--destination-bg-opacity:${ent.bg_opacity};--text-color:${ent.text_color};--bar-width:${ent.width}%;--animation-duration:${this._animDuration(ent.width)};cursor:pointer;" @click=${() => this._handleAction(ent.entity_id)}><span class="label-frame">
            <span class="destination-value"><ha-icon icon="${ent.icon}"></ha-icon>
            <span>${this._roundOff(ent.value)} ${this._parsedConfig.unit_of_measurement || ent.unit_of_measurement}</span></span>
            <span class="entity-name">${ent.name}</span>
          </span></hnl-flow-bar-destination>`;
    }
```

Modify `_renderRemainder` wrappers from plain `<span>` to `<span class="label-frame">` in both branches.

- [ ] **Step 4: Implement blueprint structural CSS**

In `src/scaffolding.js`, replace the segment and label-frame rules with this structure:

```css
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
```

Use `clip-labels` as the negative mode class in the implementation. The existing default should remain the label-fitting behavior.

- [ ] **Step 5: Move conflicting visual declarations out of scaffolding**

Ensure these declarations remain in `src/styles.js`, not `src/scaffolding.js`:

```css
    padding: var(--label-padding, 0.2em 0.4em);
    gap: 3px;
    opacity: 0.8;
    border-radius: min(0.4cqb,var(--border-radius, 8px));
    background: var(--bg-hatched), var(--bg-gradient), var(--adjusted-bg-color);
    color: var(--text-color, oklch(from var(--background-color) clamp(0, (0.6 - l) * infinity, 1) 0 0));
    box-shadow: inset 0 0 0 2px var(--background-color);
```

- [ ] **Step 6: Run targeted tests**

Run:

```bash
npm test -- test/css-modules.test.js test/card-sizing.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/scaffolding.js src/styles.js src/hnl-flow-bars-card.js test/css-modules.test.js
git commit -m "refactor: apply flow bar scaffolding model"
```

---

### Task 4: Add YAML Config For Label Clipping Mode

**Files:**
- Modify: `src/hnl-flow-bars-card.js`
- Modify: `src/editor/hnl-flow-bars-card-editor.js`
- Modify: `src/utils.js`
- Modify: `test/utils.test.js`
- Modify: `README.md`

- [ ] **Step 1: Add tests for card class construction**

In `src/utils.js`, this task will add `buildCardClass`. First modify `test/utils.test.js` imports:

```js
import {
    applyEntityValueOptions,
    applyFontSizeOptions,
    applyZeroThreshold,
    buildCardClass,
    computeEntityIcon,
} from '../src/utils.js';
```

Add:

```js
describe('buildCardClass', () => {
    it('keeps label fitting enabled by default', () => {
        expect(buildCardClass({})).toBe('');
    });

    it('adds clip-labels when label fitting is disabled', () => {
        expect(buildCardClass({
            dont_cut_off_labels: false,
        })).toBe('clip-labels');
    });

    it('preserves existing visual card classes', () => {
        expect(buildCardClass({
            transparent: true,
            theme: 'minimal',
            dont_cut_off_labels: false,
        })).toBe('transparent minimal clip-labels');
    });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test -- test/utils.test.js
```

Expected: FAIL because `buildCardClass` is not exported.

- [ ] **Step 3: Implement class helper**

Add to `src/utils.js`:

```js
export function buildCardClass(config = {}) {
    return [
        config.transparent ? 'transparent' : '',
        config.theme === 'minimal' ? 'minimal' : '',
        config.dont_cut_off_labels === false ? 'clip-labels' : '',
    ].filter(Boolean).join(' ');
}
```

- [ ] **Step 4: Use class helper in card config hydration**

Modify import in `src/hnl-flow-bars-card.js`:

```js
import { applyEntityValueOptions, applyFontSizeOptions, buildCardClass, computeEntityIcon, resolveLayoutAndTheme } from './utils.js';
```

Replace current `card_class` construction in `_hydrateParsedConfig()` with:

```js
            card_class: buildCardClass(this._rawConfig),
```

Add default in `setConfig()`:

```js
            dont_cut_off_labels: config.dont_cut_off_labels ?? true,
```

- [ ] **Step 5: Add the editor switch**

In `src/editor/hnl-flow-bars-card-editor.js`, inside `_fireConfigChanged()`, after the `energy_date_selection` cleanup line, add:

```js
    if (config.dont_cut_off_labels !== false) delete config.dont_cut_off_labels;
```

In the Appearance section, after the `Animated` switch and before the Advanced expansion panel, add:

```js
          <div class="toggle-row">
            <div class="toggle-label">
              <span>Don't cut-off labels</span>
              <span class="toggle-description">Show values even when relative width is too small</span>
            </div>
            <ha-switch
              .checked=${this._config.dont_cut_off_labels ?? true}
              @change=${(ev) => this._toggleChanged('dont_cut_off_labels', ev)}
            ></ha-switch>
          </div>
```

- [ ] **Step 6: Update README**

In the card options table, add:

```markdown
| `dont_cut_off_labels` | bool | `true` | Preserve value labels by allowing tiny bars to expand to the value's intrinsic width |
```

In the YAML example, add:

```yaml
dont_cut_off_labels: true
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test -- test/utils.test.js test/css-modules.test.js
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/utils.js src/hnl-flow-bars-card.js src/editor/hnl-flow-bars-card-editor.js test/utils.test.js README.md
git commit -m "feat: add label fitting toggle"
```

---

### Task 5: Finish Visual Style Separation

**Files:**
- Modify: `src/scaffolding.js`
- Modify: `src/styles.js`
- Modify: `test/css-modules.test.js`

- [ ] **Step 1: Add stricter boundary tests**

Extend `test/css-modules.test.js` with:

```js
    it('keeps decorative styling out of scaffolding', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).not.toContain('oklch(');
        expect(source).not.toContain('repeating-linear-gradient');
        expect(source).not.toContain('@keyframes');
        expect(source).not.toContain('box-shadow');
        expect(source).not.toContain('--hnl-flow-bars-color-production');
        expect(source).not.toContain('--hnl-flow-bars-color-consumption');
    });

    it('keeps structural card sizing in scaffolding', () => {
        const source = readFileSync(scaffoldingPath, 'utf8');

        expect(source).toContain('min-height: var(--hnl-flow-bars-card-row-height');
        expect(source).toContain('container-type: size');
        expect(source).toContain('container-name: card');
        expect(source).toContain('container-name: bar-row');
    });
```

- [ ] **Step 2: Run test to verify failure if visual rules remain in scaffolding**

Run:

```bash
npm test -- test/css-modules.test.js
```

Expected: FAIL if any visual rules remain in `src/scaffolding.js`; otherwise PASS and continue.

- [ ] **Step 3: Move visual rules into `src/styles.js`**

Move these rule groups from `src/scaffolding.js` to `src/styles.js` if present:

```css
ha-card.transparent { ... }
ha-card.transparent > .card-content { ... }
hnl-flow-bars.gradient ... { ... }
hnl-flow-bars.native.gradient ... { ... }
hnl-flow-bars.native.minimal ... { ... }
hnl-flow-bars hnl-flow-bar-source-accolade.hatched,
hnl-flow-bars hnl-flow-bar-destination.hatched,
hnl-flow-bars hnl-flow-bar-source-label.hatched { ... }
@keyframes stripe-scroll-left-3 { ... }
@keyframes stripe-scroll-right-3 { ... }
@keyframes stripe-scroll-left-2 { ... }
@keyframes stripe-scroll-right-2 { ... }
```

Keep structural class selectors in scaffolding only when they change layout geometry. Example: `hnl-flow-bars.native { grid-template-rows: 1fr 1fr; }` belongs in scaffolding, while `hnl-flow-bars.native hnl-flow-bar-source-label:first-child { border-radius: 9999px 0 0 9999px; }` belongs in styles.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- test/css-modules.test.js test/card-sizing.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scaffolding.js src/styles.js test/css-modules.test.js
git commit -m "refactor: enforce css scaffolding boundaries"
```

---

### Task 6: Full Verification And Regression Pass

**Files:**
- Modify: none unless verification exposes a bug

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
npm test
```

Expected: all test files pass.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Rollup builds `dist/hnl-flow-bars-card.js` successfully.

- [ ] **Step 3: Inspect generated bundle for module inclusion**

Run:

```bash
rg -n "clip-labels|hnl-flow-bars-card-row-height|stripe-scroll-left-3" dist/hnl-flow-bars-card.js
```

Expected: all three strings are present.

- [ ] **Step 4: Confirm no blueprint debug CSS leaked**

Run:

```bash
rg -n "PRESENTATIONAL DEBUGGING STYLES|outline: 1px solid blue|width: 600px|height: 150px|margin: 0 auto" src dist
```

Expected: no matches.

- [ ] **Step 5: Commit final verification-only doc update if needed**

If no files changed during verification, do not commit. If README wording changed, commit:

```bash
git add README.md
git commit -m "docs: describe css module split"
```

---

## Manual Browser Check

After Task 6, install or load the built card in Home Assistant and check:

- Default accolade layout: source labels, accolades, and destination bars still align.
- Native layout: stacked rows still align.
- Contained native theme: destination overlay remains centered and names still hide when cramped.
- `dont_cut_off_labels: true`: a `5%` source with value `5 kWh` keeps the value visible.
- `dont_cut_off_labels: false`: the same `5%` source respects relative width and clips the value if necessary.
- Long entity names: names ellipsize and do not widen bars.
- Transparent card: background, border, and shadow are still removed.
- Hatched and animated remainder: visual pattern still appears and animates.

## Self-Review Notes

- The plan explicitly ignores the presentational debug CSS in `flexbox-model.html`.
- The plan keeps the prototype's layout mechanics but maps them onto the existing production element names.
- The plan uses TDD for module boundaries and class behavior before implementation.
- The plan avoids changing visual design in the extraction task; visual separation is tightened only after the modules exist and build.
