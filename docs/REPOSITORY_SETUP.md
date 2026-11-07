# Repository administration checklist

**Status checked:** 2026-11-07. These are GitHub UI settings, not modifications that this repository file automatically enforces.

## Observed at initial setup

- GitHub Actions is enabled and PR-triggered workflow runs were observed.
- The default branch is `master`. A repository Ruleset named `protect-master` is **active**, requiring PRs, CI checks and resolved conversations; it disallows force-push/deletion. Verify enforcement in GitHub when changing check names.
- GitHub Issues is **enabled**; work items #2–#5 are now in GitHub.
- No npm publishing or OT deployment workflow has been added.
- This assistant's available GitHub integration cannot change repository feature flags or branch-protection rulesets.

## Required one-time action for the human maintainer

1. **Issues:** Already enabled; continue using [Issues](https://github.com/Missel2/node-red-contrib-s7/issues) and link the [work index](WORK_INDEX.md). Do not re-create duplicates.
2. **Master ruleset:** Active as `protect-master`; monitor that the required CI check names continue to match workflow job names. Do not turn off protection just to bypass a test.
3. **Set review policy suitable for a solo maintainer:** PRs created through the Missel2 account cannot be formally approved by the same account as an independent reviewer. Do not configure a required GitHub approving review without a second eligible reviewer, or the sole-maintainer workflow may deadlock. The human owner should still make an explicit merge decision after reviewing the PR and CI. A second independent reviewer can be introduced later.
4. **Keep workflows least-privileged:** The first workflow requests `contents: read`, uses no production secrets and neither publishes packages nor accesses PLC networks.
5. **Avoid auto-publishing:** Do not enable unattended npm package publishing or production OT deployments merely because a pull request passes CI.

## Suggested required checks

The current workflow job names (confirm in the GitHub Rules UI, as names may change):
- `Wrapper contract (ubuntu-24.04, Node 22)`
- `Wrapper contract (ubuntu-24.04, Node 24)`
- `Wrapper contract (windows-2025, Node 22)`
- `Wrapper contract (windows-2025, Node 24)`
- `Baseline must fail stale-read regression`
- `Package dependency smoke (Ubuntu, Node 22)`

These checks verify the wrapper and package smoke gates only. They do **not** yet establish S7 wire-protocol simulation, packet-error handling in nodes7 or Siemens hardware compatibility.

## Ongoing gate improvements

- Generate a correct npm lockfile and enforce `npm ci` before qualifying a release.
- Add disposable S7 wire-protocol fixtures, fault injection and redacted logs on public hosted runners.
- Add dependency advisory triage and security disclosure workflows without exposing plant data.
- Consider branch rule adjustments only after reviewing CI behavior and avoiding single-maintainer review deadlocks.
