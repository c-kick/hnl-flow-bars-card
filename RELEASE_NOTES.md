# v1.9.4 — maintenance release (prepared, unpublished)

## Bug fixes

- Refresh readings, names, and configuration in the same render cycle.
- Keep energy statistics within the selected date range, including partial months.
- Show a warning and zero contribution when historical statistics are missing, instead of substituting live totals.
- Cancel pending energy subscriptions on removal, wait for the Home Assistant connection, and rebind when the connection or dashboard changes.
- Prevent another dashboard's date selection from being used accidentally.
- Calculate surplus and shortfall from unrounded readings before rounding the result.
- Reject nonnumeric and infinite readings before calculating bar widths.
- Preserve zero background opacity when editing and saving configuration.
- Restore editor input hints and button icons using current Home Assistant component bindings.
- Remove requests to nonexistent standalone Home Assistant icon modules; keep explicit icons and the existing local fallback mapping.
- Load the entity picker when the editor connects and handle loading failures.

## Compatibility

- Declare Home Assistant 2026.4 as the minimum version in `hacs.json` and the README. The visual editor has required 2026.4 since it adopted `ha-input`; HACS will no longer offer the card to older installations, where the editor's text fields render empty.

## Maintenance

- Review Home Assistant changes from July 15 through September 15, 2026; see [the compatibility audit](docs/maintenance-audit-2026-09.md).
- Check compatibility against Home Assistant 2026.10.0 (frontend 20260930.2): developer blog posts from October 2025 onward, frontend elements, and the energy collection key. No code changes needed.
- Declare the DOM test dependency, update affected development dependencies, and run tests in build and release workflows.

No new configuration options. Existing default energy date pickers continue to work; custom collection keys are not supported.
