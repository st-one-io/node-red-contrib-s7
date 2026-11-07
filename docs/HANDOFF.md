# Development handoff

**Last updated:** 2026-11-07 — confirm current PR and CI before acting.

## Working model and scope

- Repository: `Missel2/node-red-contrib-s7`; protected default branch `master`.
- PR #1: [development process and hosted CI baseline](https://github.com/Missel2/node-red-contrib-s7/pull/1).
- The intended final PR #1 diff makes **no changes to `red/s7.js`**. Experimental code-level fixes from earlier PR revisions were intentionally returned to the upstream baseline on this branch. Do not revive them in this PR.
- PR #1 includes AI assistance disclosure, upstream provenance/thanks, issue & PR templates, stable documentation handoff, Windows/Linux hosted CI, four positive wrapper baseline tests and one expected failing stale-read characterization test. Node-RED and nodes7 are mocked; no S7 wire/CPU evidence.
- The baseline stale-read test is a **confirmed expected failure** on unmodified upstream code; green CI for that job means reproduction, not repair.
- The inherited `package-lock.json` does not match `package.json` and remains a separately tracked issue.

## First action for next session

1. Check **PR #1 current head and CI**. Fix bootstrap test/workflow defects only.
2. Review that `red/s7.js` has no PR diff, the source credit links are accurate, no release/deployment is implied, and the required status checks still match `protect-master`.
3. If all six required CI checks pass on the actual head, provide concise human merge recommendation **for bootstrap only**. Do not claim any S7 runtime defect fixed.
4. Do not merge automatically; human maintainer decides.

## Follow-up work (test first)

- [#2](https://github.com/Missel2/node-red-contrib-s7/issues/2): prove or disprove pending ISO-on-TCP handshake teardown defect in nodes7, then patch independently.
- [#3](https://github.com/Missel2/node-red-contrib-s7/issues/3): characterize stale reads/reconnect overlap with baseline-failing tests; then a narrow wrapper fix PR.
- [#4](https://github.com/Missel2/node-red-contrib-s7/issues/4): licensed disposable S7 protocol fixture and controllable TCP faults on hosted Ubuntu/Windows.
- [#5](https://github.com/Missel2/node-red-contrib-s7/issues/5): regenerate the stale lockfile and enforce npm ci.

## Guards

- No auto-merge, npm publication, productive OT deploy or real PLC writes.
- Separate mocked behavior from wire-protocol/server tests and hardware verification.
- A previous public PR revision contained a private registry hostname; the current documents omit it, but old GitHub references could persist. Do not repeat private identifiers.
