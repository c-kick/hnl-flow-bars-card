# `css_vars` YAML Option Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation code, and use superpowers:verification-before-completion before claiming completion.

**Goal:** Add a top-level `css_vars` YAML option that lets users override any card CSS custom property in the `--hnl-flow-bars-*` namespace without requiring `card_mod`.

**Example:**

```yaml
type: custom:hnl-flow-bars-card
production:
  - entity: sensor.verbruik_stroomgroep_3
consumption:
  - entity: sensor.energiemeting_totaal_gemeten_verbruik_nu
css_vars:
  destination-bg-opacity: 1
  label-edge-padding: 1rem
```

This must produce effective host-level CSS custom properties:

```css
--hnl-flow-bars-destination-bg-opacity: 1;
--hnl-flow-bars-label-edge-padding: 1rem;
```

## Current Architecture

- `src/scaffolding.js` defines layout-related `:host` variables such as `--hnl-flow-bars-accolade-height`, `--hnl-flow-bars-font-size-*`, `--hnl-flow-bars-card-row-height`, and `--hnl-flow-bars-card-grid-gap`.
- `src/styles.js` defines visual/theme `:host` variables such as `--hnl-flow-bars-destination-bg-opacity`, `--hnl-flow-bars-border-radius`, `--hnl-flow-bars-label-edge-padding`, colors, and label padding.
- `src/utils.js` already converts YAML font sizing options into inline CSS variables through `applyFontSizeOptions(config)`.
- `src/hnl-flow-bars-card.js` currently applies `applyFontSizeOptions()` to `<hnl-flow-bars>` via `styleMap(flowBarsStyle)`.
- `setConfig()` stores known YAML options in `_rawConfig`; unknown top-level config keys are not preserved.

## Design Decisions

1. `css_vars` is a top-level object.
2. Keys may be short names or fully qualified custom property names:
   - `destination-bg-opacity`
   - `--hnl-flow-bars-destination-bg-opacity`
3. Short names are normalized by prefixing `--hnl-flow-bars-`.
4. Fully qualified keys are accepted only when they already start with `--hnl-flow-bars-`.
5. Keys outside the `--hnl-flow-bars-*` namespace are ignored.
6. Invalid keys are ignored rather than throwing, so a bad optional styling override does not break the whole card.
7. Values are converted with `String(value).trim()`; empty/null/undefined values are ignored.
8. Normalized `css_vars` are applied to the custom element host with `this.style.setProperty(...)`, not only to `<hnl-flow-bars>`, because both scaffolding and visual defaults are declared on `:host`.
9. Previously applied host variables must be removed when `css_vars` changes or is removed from config.
10. Built-in specific options keep priority over broad `css_vars` when both target the same variable. For example, `font_size_max` should override `css_vars.font-size-max` because explicit card options are more constrained and already validated.
11. The visual editor does not need controls for `css_vars`, but it must preserve an existing `css_vars` object when a user edits unrelated fields.
12. The implementation should expose pure utility seams for normalization and style-object composition so the behavior is testable without a browser DOM.

## Staff Review And Project Ambassador Decisions

Staff review verdict: **approve-with-changes**.

The plan is small and aligned with the existing Lit/custom-property architecture, but the first draft had three risks:

1. Host-level style cleanup was specified as component behavior but not made testable.
2. Style priority between `css_vars` and existing font options needed a pure test seam.
3. The visual editor preservation requirement was implicit, not explicit.

Project ambassador decision: **apply all three recommendations.**

Rationale from project sources:

- `CLAUDE.md` requires README updates for feature/config changes.
- `CLAUDE.md` emphasizes namespaced CSS custom properties because generic names can conflict with Home Assistant/editor styling.
- Current tests already favor pure utilities in `src/utils.js` for config-to-style behavior, so the plan should keep this feature testable there instead of depending on browser-only LitElement state.

## Security And Safety

CSS custom property values are user-controlled YAML strings. They should be treated as styling input, not executable code, but the implementation must still limit the blast radius:

- Only allow `--hnl-flow-bars-*` variables.
- Do not allow arbitrary custom property names such as `--primary-color`, `--card-background-color`, or unprefixed `background`.
- Do not inject values into a stylesheet string.
- Use DOM style APIs (`setProperty` / `removeProperty`) or Lit `styleMap`, never string-concatenated `style=""` for `css_vars`.
- Do not attempt full CSS value validation. The browser can reject invalid property values, and card CSS variables intentionally need to support CSS values such as `var(...)`, `calc(...)`, colors, lengths, numbers, and OKLCH expressions.

## Implementation Tasks

### Task 1: Add Failing Unit Tests For CSS Var Normalization

**Files:**
- Modify: `test/utils.test.js`

- [x] Import new utilities named `normalizeCssVars` and `buildFlowBarsStyle`.
- [x] Add tests that prove shorthand keys are prefixed:

```js
expect(normalizeCssVars({
    'destination-bg-opacity': 1,
    'label-edge-padding': '1rem',
})).toEqual({
    '--hnl-flow-bars-destination-bg-opacity': '1',
    '--hnl-flow-bars-label-edge-padding': '1rem',
});
```

- [x] Add tests that prove already-prefixed keys are preserved:

```js
expect(normalizeCssVars({
    '--hnl-flow-bars-card-row-height': '72px',
})).toEqual({
    '--hnl-flow-bars-card-row-height': '72px',
});
```

- [x] Add tests that prove non-card namespaces and malformed keys are ignored:

```js
expect(normalizeCssVars({
    '--primary-color': 'red',
    'background': 'red',
    '--hnl-other-value': '1px',
    '': '1px',
})).toEqual({});
```

- [x] Add tests that prove empty values are ignored:

```js
expect(normalizeCssVars({
    'label-padding': '',
    'border-radius': null,
    'card-grid-gap': undefined,
})).toEqual({});
```

- [x] Add tests that prove non-object inputs return `{}`:

```js
expect(normalizeCssVars(null)).toEqual({});
expect(normalizeCssVars(undefined)).toEqual({});
expect(normalizeCssVars([])).toEqual({});
expect(normalizeCssVars('destination-bg-opacity')).toEqual({});
expect(normalizeCssVars(1)).toEqual({});
```

- [x] Add tests that prove `buildFlowBarsStyle()` merges normalized `css_vars` with existing font sizing options, and explicit font options win:

```js
expect(buildFlowBarsStyle({
    css_vars: {
        'font-size-max': '30px',
        'destination-bg-opacity': 1,
    },
    font_size_max: '18px',
})).toEqual({
    '--hnl-flow-bars-font-size-max': '18px',
    '--hnl-flow-bars-destination-bg-opacity': '1',
});
```

Run:

```bash
npm test -- test/utils.test.js
```

Expected before implementation: fail because `normalizeCssVars` and `buildFlowBarsStyle` do not exist.

### Task 2: Implement Pure CSS Var Utilities

**Files:**
- Modify: `src/utils.js`

- [x] Export `normalizeCssVars(input = {})`.
- [x] Return `{}` unless `input` is a plain object. Arrays and `null` must return `{}`.
- [x] For every entry:
  - trim key.
  - ignore empty keys.
  - if key starts with `--`, require `--hnl-flow-bars-`.
  - if key does not start with `--`, require only lowercase letters, numbers, and hyphens.
  - normalize shorthand to `--hnl-flow-bars-${key}`.
  - ignore null/undefined values.
  - stringify and trim values.
  - ignore empty string values.
- [x] Keep the utility pure and side-effect free.
- [x] Export `buildFlowBarsStyle(config = {})`.
- [x] Implement `buildFlowBarsStyle()` as:

```js
return {
    ...normalizeCssVars(config.css_vars),
    ...applyFontSizeOptions(config),
};
```

This guarantees constrained built-in font options override broad `css_vars` values for the same variable.

Run:

```bash
npm test -- test/utils.test.js
```

Expected after implementation: pass.

### Task 3: Store And Apply `css_vars`

**Files:**
- Modify: `src/hnl-flow-bars-card.js`

- [x] Import `buildFlowBarsStyle` and `normalizeCssVars` from `src/utils.js`.
- [x] Add a private field such as `_appliedCssVars = new Set();`.
- [x] Store normalized custom properties in `_rawConfig`:

```js
css_vars: normalizeCssVars(config.css_vars),
```

- [x] Add a method such as `_applyHostCssVars()`:
  - remove properties in `_appliedCssVars` that are no longer present.
  - set all properties from `this._rawConfig.css_vars`.
  - update `_appliedCssVars`.
- [x] Call `_applyHostCssVars()` from `setConfig()` after `_rawConfig` is assigned.
- [x] In `disconnectedCallback()`, remove all applied host variables before or after existing energy cleanup.
- [x] Replace the direct `applyFontSizeOptions()` render call with `buildFlowBarsStyle(this._rawConfig)` so `<hnl-flow-bars>` receives normalized `css_vars` plus existing font sizing behavior.

```js
const flowBarsStyle = buildFlowBarsStyle(this._rawConfig);
```

The host application is required for `:host` defaults, while the `<hnl-flow-bars>` inline style preserves existing behavior for variables consumed beneath that element.

Run:

```bash
npm test
npm run build
```

### Task 4: Add Behavioral Tests For Config Storage And Style Priority

**Files:**
- Modify existing unit tests if possible, or add a focused test file if DOM limitations require extracted logic.

- [x] Test that normalized `css_vars` are included in `buildFlowBarsStyle()` output.
- [x] Test that `font_size_max` wins over `css_vars.font-size-max`.
- [x] Test that invalid `css_vars` keys do not appear in the style object.

If host-style cleanup needs unit coverage without a browser DOM, extract a tiny pure reconciliation helper or test `_applyHostCssVars()` with a fake style object exposing `setProperty()` and `removeProperty()`.

Do not skip cleanup coverage entirely. Stale host variables after config changes are a real behavior risk.

### Task 5: Preserve `css_vars` Through The Visual Editor

**Files:**
- Modify only if needed: `src/editor/hnl-flow-bars-card-editor.js`
- Test manually or with a focused unit if an editor test harness exists.

- [x] Verify the editor keeps `css_vars` when calling `_fireConfigChanged()` for unrelated fields.
- [x] If the current spread/cleanup logic already preserves it, leave editor code unchanged and mention this in the implementation notes.
- [x] Do not add visual editor controls for `css_vars` in this iteration.

### Task 6: Document The YAML Option

**Files:**
- Modify: `README.md`

- [x] Add `css_vars` to the top-level card options table.
- [x] Add a short example:

```yaml
css_vars:
  destination-bg-opacity: 1
  label-edge-padding: 1rem
  card-row-height: 72px
```

- [x] Document normalization:
  - `destination-bg-opacity` maps to `--hnl-flow-bars-destination-bg-opacity`.
  - `--hnl-flow-bars-destination-bg-opacity` is also accepted.
  - non-`--hnl-flow-bars-*` variables are ignored.
- [x] Keep `card_mod` described only as an advanced fallback for styling outside the card's exposed namespace.
- [x] Include at least one scaffolding variable and one visual/theme variable in the example, such as `card-row-height` and `destination-bg-opacity`.

### Task 7: Release Notes Update

**Files:**
- Modify release note draft if one exists, otherwise prepare text for the release.

Include:

```md
### Added

- Added `css_vars`, a YAML option for overriding `--hnl-flow-bars-*` CSS custom properties without `card_mod`.
```

Prepared release note text:

```md
### Added

- Added `css_vars`, a YAML option for overriding `--hnl-flow-bars-*` CSS custom properties without `card_mod`. Shorthand keys such as `destination-bg-opacity` are normalized to `--hnl-flow-bars-destination-bg-opacity`, while variables outside the card namespace are ignored.
```

## Verification Checklist

- [x] `npm test`
- [x] `npm run build`
- [x] Confirm README documents `css_vars` before commit.
- [x] Confirm existing `font_size_scale` and `font_size_max` behavior is unchanged by tests.
- [x] Manual YAML smoke example / local substitute:

```yaml
type: custom:hnl-flow-bars-card
production:
  - entity: sensor.solar_power
consumption:
  - entity: sensor.house_power
css_vars:
  destination-bg-opacity: 1
  label-edge-padding: 1rem
```

Expected in Home Assistant: card renders normally; destination opacity and label edge padding reflect the overrides.

Local substitute used in this workspace: `normalizeCssVars()` and `buildFlowBarsStyle()` tests verify that the YAML-style shorthand keys in the example become the expected `--hnl-flow-bars-*` properties, and `npm run build` verifies the card bundle compiles. A live HA render check still requires loading the built card in Home Assistant.

## Non-Goals

- Do not support arbitrary CSS properties.
- Do not support overriding non-card namespaces.
- Do not add a visual editor UI for `css_vars` in this iteration.
- Do not validate every possible CSS value.
- Do not remove existing `font_size_scale` or `font_size_max` options.
