# Maintenance audit — September 15, 2026

## Scope and conclusion

Reviewed the shipped card, utilities, energy integration, all three editors, styles, scaffolding, build configuration, workflows, and tests. Research window: **July 15–September 15, 2026**, including July patch releases and August/September releases. Latest published card release verified as v1.9.3; v1.9.4 is prepared locally.

No newly announced removal was found for the public Lovelace hooks or recorder command this card uses. There were existing incorrect component bindings and runtime bugs. The energy collection remains a private frontend dependency, so this review is not a guarantee of compatibility with future Home Assistant versions.

## Upstream review

| Surface | Evidence and applicability |
| --- | --- |
| Core release notes | [July, including patches after July 15](https://www.home-assistant.io/blog/2026/07/01/release-20267/), [August](https://www.home-assistant.io/blog/2026/08/05/release-20268/), [September](https://www.home-assistant.io/blog/2026/09/02/release-20269/); checked dashboard, energy, recorder and incompatible-change entries. |
| Full Core changes | [2026.8](https://www.home-assistant.io/changelogs/core-2026.8/), [2026.9](https://www.home-assistant.io/changelogs/core-2026.9/). The Python entity attribute enum migrations do not require JavaScript clients to replace state attribute names. |
| Frontend releases | Reviewed release entries published in the window through [20260826.7](https://github.com/home-assistant/frontend/releases/tag/20260826.7), including [20260729.0](https://github.com/home-assistant/frontend/releases/tag/20260729.0) and [20260826.0](https://github.com/home-assistant/frontend/releases/tag/20260826.0). Relevant changes include energy date-picker initialization without energy preferences, collection cleanup, and entity naming. |
| Developer announcements | [Archive](https://developers.home-assistant.io/blog/archive/): checked the window's announcements for frontend and WebSocket impact; Modbus, OAuth, Configurator and lawn-mower Python changes are not called by this card. |
| August frontend updates | [Announcement](https://developers.home-assistant.io/blog/2026/07/31/frontend-component-updates-2026.8/): `state_color` migration affects entities/glance cards; this card does not use it. Conditional forms, new selectors, safe-area handling and dirty-state infrastructure do not require changes here. |
| Device registry deprecations | [WebSocket changes](https://developers.home-assistant.io/blog/2026/08/19/device-registry-websocket-api-changes/): old config-entry fields are scheduled for 2027.8 removal; the old remove command for 2027.9. This card neither reads those fields nor calls that command. It delegates names to `hass.formatEntityName`. |
| Lovelace hooks | [Custom card contract](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/): `setConfig`, `getCardSize`, `getGridOptions`, `getConfigElement`, `getStubConfig` and custom-card registration remain applicable. `hass-action` is retained. |
| Editor bindings | Stable [ha-input](https://github.com/home-assistant/frontend/blob/20260826.7/src/components/input/ha-input.ts) uses `hint`; [ha-button](https://github.com/home-assistant/frontend/blob/20260826.7/src/components/ha-button.ts) uses the `start` icon slot. Replaced ineffective `helper`, `helperPersistent`, and `slot="icon"` bindings. |
| Energy collection | Stable [energy.ts](https://github.com/home-assistant/frontend/blob/20260826.7/src/data/energy.ts) still stores panel defaults under `_energy_${hass.panelUrl}` and subscribes through `subscribe`. Preserve legacy `_energy`; remove the arbitrary cross-panel prefix scan. No public stable module import is available for this helper. |
| Statistics API | [Recorder WebSocket schema](https://github.com/home-assistant/core/blob/2026.9.2/homeassistant/components/recorder/websocket_api.py) still accepts `recorder/statistics_during_period` with `change`, `sum`, `mean`. [Aggregation source](https://github.com/home-assistant/core/blob/2026.9.2/homeassistant/components/recorder/statistics.py) expands day/month queries to calendar boundaries. Use hourly buckets to avoid expanding the selection. |
| Icons | Stable [ha-state-icon](https://github.com/home-assistant/frontend/blob/20260826.7/src/components/ha-state-icon.ts) resolves icons through frontend context and internal icon data. The card's guessed standalone module URLs are not supported exports; removed those requests and retained its explicit/local icons. Full HA state-dependent icon resolution is not claimed. |

## Confirmed findings and repairs

| Severity | Finding and trigger | Repair / evidence |
| --- | --- | --- |
| High | A new `hass` renders cached readings before `updated()` refreshes them, leaving the visible card one update behind. | Hydrate in `willUpdate`; DOM regression checks a single update from 10 to 25. |
| Medium | `setConfig()` does not schedule a render. Registry-only name changes do not invalidate cached labels. | Request a config update and observe formatter/registry changes. DOM tests cover both. |
| High | A missing statistic substitutes a live cumulative sensor total into a historical chart. | Zero contribution plus existing warning; regression uses a live total of 12000. |
| High | A range exceeding 35 days requests monthly buckets, including readings outside partial months. | Hourly requests preserve supplied boundaries; regression checks July 15–September 2. Larger responses are the tradeoff. |
| Medium | Polling captures missing `hass`, survives disconnection until timeout, and may select another dashboard's collection. | Wait for a connection, cancel polling with an AbortSignal, rebind on connection/panel change, and use only the matching/legacy collection. Lifecycle and fake-timer tests cover these paths. |
| Medium | A forced collection refresh duplicates initialization and can reject without a handler. A subscription throw in a timer escapes the promise. | Let `subscribe` own initial loading and catch delayed subscription errors. |
| Medium | Subtracting rounded bars loses real remainders: two 0.6 readings against 2 yield zero instead of a rounded shortfall of 1. | Round the raw difference. Regression invokes the actual card method. |
| Medium | `Infinity`, overflow and partial numeric strings enter width calculations. | Require a finite numeric state and show the existing invalid-state warning. |
| Medium | Saving unrelated editor changes deletes numeric zero opacity; sliders display defaults instead of zero. | Distinguish absent values from zero at every opacity level. DOM/event regression covers saved output and sliders. |
| Low | Editor hints and button icons use the wrong HA property/slot; icon module probes cause failed requests. | Correct bindings and remove unsupported imports. |
| Medium | Tests import undeclared `happy-dom`; clean installs cannot reliably run them. Workflows build without testing. | Add an exact DOM dependency and run tests before builds/releases. |

## Validation results

- Clean install: Node 22.22.1 / npm 10.9.4, `npm ci --ignore-scripts`, successful without package deprecation warnings.
- `npm test -- --maxWorkers=2`: **139 tests passed across 12 files**, including 18 additional regression cases.
- `npm run build`: successful in both the clean checkout and working tree; generated assets have identical SHA-256 hashes.
- `npm audit --audit-level=low`: **zero reported vulnerabilities** in the final dependency tree.
- `git diff --check`: clean. Editor mechanical detector: no findings.
- Final validation ran with a 1 GiB memory limit, no swap allowance, 64-task limit and 180-second deadline; completed successfully with a 253.9 MiB memory peak.

## Validation limits

Development dependencies were updated to Vitest 4.1.11, Vite 7.3.6, Terser plugin 1.0.0 and CommonJS plugin 29.0.3, with Happy DOM 20.9.0 explicitly declared. The CommonJS update removes its unsupported Glob 10 dependency. These tools are not shipped as dependencies inside Home Assistant. No runtime framework migration was needed.

The installed npm 10.9.4 crashed while resolving optional peers during the dependency update (`edgesOut` in Arborist). A temporary npm 11 executable generated the updated lockfile; Node 22 with the standard npm 10 successfully performed the subsequent clean `npm ci --ignore-scripts`, tests and production build. Vite is pinned to the supported 7.x line to keep this maintenance release on the existing test toolchain generation.

Regression tests exercise real Lit rendering in Happy DOM and mocked Home Assistant collections/WebSocket replies. These do not execute a complete Home Assistant frontend or verify real recorder data. The collection API remains private; custom `collection_key` support is outside the existing configuration contract. Styles were inspected but this maintenance pass is not a full visual/accessibility audit.

No release, tag, push, or Home Assistant restart is part of this preparation.

## Addendum — October 7, 2026 (Home Assistant 2026.10.0)

Rechecked against Core 2026.10.0 / frontend 20260930.2, reviewing developer blog posts from October 2025 onward.

- All ten frontend elements used (`ha-alert`, `ha-button`, `ha-card`, `ha-entity-picker`, `ha-expansion-panel`, `ha-icon`, `ha-icon-button`, `ha-icon-picker`, `ha-input`, `ha-switch`) exist in 20260930.2. `ha-input` first ships in 20260325.5 (Core 2026.4.0) and is absent from 20260304.0 (Core 2026.3.0), so the editor's effective minimum is 2026.4; this is now declared in `hacs.json`.
- No removed tokens or components are used (2026.5 switch/shadow tokens, `ha-textfield`, `ha-radio`, `ha-fab`, 2026.7 button size names).
- [energy.ts at 20260930.2](https://github.com/home-assistant/frontend/blob/20260930.2/src/data/energy.ts): the default collection key is still `_energy_${hass.panelUrl}` with `_energy` as the no-panel fallback. The new server-time-zone shift only applies to day/month periods; the card requests hourly statistics.
- The recorder statistics metadata deprecations (removal 2026.11) affect `import_statistics`, `update_statistics_metadata` and `list_statistic_ids`, which the card does not call.
- The HACS Validate workflow had been disabled by GitHub for inactivity and was re-enabled.
