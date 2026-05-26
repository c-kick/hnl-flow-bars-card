# Verification Findings: `css_vars` YAML option

**Verdict:** FAIL

**Scope:** Verification of the just-implemented `css_vars` feature (top-level YAML option for overriding `--hnl-flow-bars-*` CSS custom properties).

**Method:** No browser binary on this host (no chromium/chrome) and no Puppeteer/Playwright MCP available. Drove the real `src/hnl-flow-bars-card.js` class against `happy-dom` (installed `--no-save`), exercising `setConfig` through the custom-element lifecycle and capturing `el.style.cssText`, `_appliedCssVars`, and `_rawConfig.css_vars`. Build (`npm run build`) ran clean. The real HA dashboard surface was **not** exercised.

---

## What works

1. **`setConfig` with valid + invalid `css_vars`** — host inline style contains exactly the namespaced properties:
   ```
   --hnl-flow-bars-destination-bg-opacity: 1;
   --hnl-flow-bars-label-edge-padding: 1rem;
   --hnl-flow-bars-card-row-height: 72px;
   ```
2. **Invalid keys filtered.** Probed `--primary-color`, `background`, `''`, `UPPERCASE-KEY` → all rejected, none reached host or `_rawConfig`.
3. **Stale-key cleanup on re-`setConfig`.** Removed keys disappear from host style, changed values update in place, new keys are added.
4. **`css_vars` omitted entirely** → host inline style fully cleared, `_appliedCssVars` empty.
5. **Priority via `buildFlowBarsStyle`** — `font_size_max: '18px'` correctly overrides `css_vars: {'font-size-max': '30px'}` for the same variable.
6. **Shorthand regex** `/^[a-z0-9]+(?:-[a-z0-9]+)+$/` correctly rejects uppercase keys, single-segment keys (`background`), and malformed hyphenation. Single-word shorthand like `radius` would also be rejected (must contain at least one hyphen) — fine since every real `--hnl-flow-bars-*` variable is multi-word, but worth knowing.

---

## What's broken

### Reconnect data-loss bug (blocking)

**Symptom:** Whenever the card element is detached and re-attached without a fresh `setConfig` call, every `css_vars` override silently disappears from the host inline style.

**Reproduction (against the real `src/hnl-flow-bars-card.js`, happy-dom harness):**

```
After append + setConfig: "--hnl-flow-bars-destination-bg-opacity: 1;"
After parent.removeChild(el): ""
After parent.appendChild(el): ""        ← override gone, no setConfig called
_rawConfig.css_vars still:  { '--hnl-flow-bars-destination-bg-opacity': '1' }
```

Confirmed `disconnectedCallback` is the culprit, not the harness: a plain `<div>` with `style.setProperty('--x','1')` keeps its `cssText` across `removeChild` in the same harness — only the card explicitly clears via `_clearHostCssVars`.

**Root cause:** `disconnectedCallback` calls `_clearHostCssVars`, but `connectedCallback` does not call `_applyHostCssVars`. The cleanup is asymmetric.

**Real-world trigger:** any case where HA re-attaches the same card instance without recreating it — Lovelace masonry reflow, section/grid card moves, panel transitions, edit-mode toggles in some layouts. The user sets `css_vars`, sees the override, then it silently vanishes on the next reflow.

**Fix (two options, either works):**

- Drop `this._clearHostCssVars()` from `disconnectedCallback`. Inline styles on a detached element are harmless; if it's re-attached they're still there. This was the recommendation in the original plan review.
- Or, add a re-apply call in `connectedCallback`:
  ```js
  connectedCallback() {
      super.connectedCallback();
      if (this._rawConfig) this._applyHostCssVars();
      this._subscribeEnergy();
  }
  ```

Dropping the cleanup is simpler and matches the existing assumption that `_rawConfig.css_vars` is preserved across disconnect anyway (it already is — only the inline style is wiped).

---

## Surface gap

The HA dashboard surface was not exercised — no browser binary or Puppeteer MCP available on this host. The findings above hold regardless of HA specifics: the reconnect bug is reproducible in any environment that re-attaches the element without a fresh `setConfig`.

For a final ✅ on the real surface after the fix:
1. Hard-refresh the dashboard, confirm the `css_vars` override is applied.
2. Toggle dashboard edit-mode on/off (which often re-parents cards) and confirm the override still holds.
3. With current (unfixed) code, expect step 2 to drop the override.

---

## Other notes

- `npm run build` exits clean (1835-line bundle, no warnings).
- `_rawConfig.css_vars` is correctly preserved across disconnect, so the fix is trivial — the data to re-apply is sitting right there.
- The three pure utilities (`normalizeCssVars`, `buildFlowBarsStyle`, `syncHostCssVars`) are covered by the new unit tests in `test/utils.test.js` and behaved correctly when driven from the real card class.
