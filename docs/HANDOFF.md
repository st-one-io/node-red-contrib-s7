# Development handoff

**Last updated:** 2026-11-07. Review current branches/issues/CI before assuming this snapshot is fresh.

## Repository and current reviewed facts

- Repo: `Missel2/node-red-contrib-s7`; protected default branch `master`, current base after PR #1 squash `42296d824c09964f6f10a2ed0e9ce469f3600555`. PR #1 is merged and the master push workflow passed.
- **Draft PR #6:** https://github.com/Missel2/node-red-contrib-s7/pull/6, branch `test/issue-3-characterize-stale-read-reconnect`. All five known defects are individually reproduced via expected-failure mocked tests against **unchanged** `red/s7.js`, and one positive repeated-trigger test passed.
- [CI 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004) passed all six required checks for commit `1fbd93da39e7f52fc8b9581b417f7ada7a7c328b`. This includes a **green expected-failure characterization gate**; it is not a working S7 reliability fix. Any later doc commits will need exact-head checks.
- `package-lock.json` inherited stale, and real S7 wire protocol has not yet been tested. No fork npm release or physical PLC evidence.

## Future physical hardware test requirement

- The maintainer plans an isolated Siemens S7-1200 on a dedicated RischLab runner, tracked in [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8). **No hardware exists in this CI yet.**
- Every change/PR must list applicable future `HIL-S7-*` cases (or a justified N/A) from [HIL_TEST_MATRIX.md](HIL_TEST_MATRIX.md). Current work in PR #6 maps to HIL-S7-004, HIL-S7-005 and HIL-S7-007, all `PENDING_HARDWARE`.
- Do not run public/untrusted PR head code against any hardware-accessible runner. Real PLC writes require separate authorization and isolated scratch data; no actual PLC interaction has been authorized.

## Next focused work

1. Verify draft PR #6 current head and full six-job CI; inspect five expected failures are named **assertion failures**, not fixture crashes. Review its diff: no `red/s7.js` changes, PR HIL impact declared. After human approval, merge the **test-only** PR; do not claim runtime fixed.
2. In a subsequent independent fix PR, use this reproduction to correct one coherent Issue #3 lifecycle defect. Convert the old negative gate to a positive regression gate in coordination with the protected `master` required check name; do not make successful defect reproduction look like a fix.
3. Continue [Issue #4](https://github.com/Missel2/node-red-contrib-s7/issues/4): pinned disposable S7 wire protocol fixture and fault testing on hosted runners. Its success does not prove Siemens CPU compatibility.
4. Continue [Issue #5](https://github.com/Missel2/node-red-contrib-s7/issues/5): regenerate stale lockfile and verify `npm ci` on exact commit.
5. Keep [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) pending transport/COTP hypothesis independent until reproducible.

## Safety boundaries

No automatic merge, npm release, production PLC deployment, or unapproved real-PLC read/write activity. Earlier public commit history included a historic infrastructure identifier now redacted in current files; maintainer accepted residual historic-access risk. Do not reintroduce those identifiers or imply all public history was purged.
