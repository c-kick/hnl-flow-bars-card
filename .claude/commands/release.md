Prepare and publish a new release for hnl-flow-bars-card.

## Steps

1. **Determine version**: Look at the git log since the last release tag to understand what changed. Decide whether this is a patch (bug fix only), minor (new features), or major (breaking changes) bump. Present the proposed version to the user for confirmation before proceeding.

2. **Bump version**: Update the version string in both `src/const.js` and `package.json`.

3. **Update README**: Check that any new or changed config options, features, or behavior are reflected in README.md (card options table, entity options table, remainder options table, YAML example).

4. **Build**: Run `npm run build` (with nvm loaded) to verify the build succeeds.

5. **Commit and push**: Commit all changes with message format: `Bump version to X.Y.Z`. Push to main.

6. **Wait for Validate action**: Run `gh run list --limit 3` and wait for the Validate workflow to pass. Use `gh run watch <id> --exit-status` to block until complete.

7. **Draft release notes**: Review ALL commits since the last release tag (`git log <last-tag>..HEAD --oneline`). Separate into "## New features" and "## Bug fixes" sections. New functionality goes under features, not fixes.

8. **Confirm with user**: Present the release notes draft and ask for explicit approval before creating the release.

9. **Create release**: `gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."`. The GitHub Action will build and attach the JS asset.

10. **Rebuild locally**: Run `npm run build` so the dev mount serves the new version immediately.

## Important

- **NEVER create the release without explicit user approval** — the repo is submitted to HACS default, premature releases can interfere with review.
- HACS requires releases to be created *after* validation passes.
- If validation fails, fix the issue, push again, and re-wait.
