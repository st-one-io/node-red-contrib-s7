# Verification ledger

**Updated:** 2026-11-07. A green status check is evidence only for its named assertion and the exact commit tested.

| Item | Status | Evidence / limitations |
| --- | --- | --- |
| Upstream runtime | Preserved after merged PR #1 | No `red/s7.js` modification in PR #1 or draft PR #6. Original runtime still contains known connection lifecycle bugs |
| Project governance and credits | Merged in PR #1 | Public AI-assisted workflow, upstream credits, GitHub issue/PR tracking and active required checks on protected `master` |
| Baseline wrapper behavior | CI-verified in original PR #1 and draft PR #6 | Five positive isolated Node-RED wrapper tests, including repeated-trigger coalescing; nodes7 remains stubbed. [PR #6 run 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004) |
| Stale read after disconnect | **Confirmed bug reproduction** | [Initial expected-failure check, CI 42358368272](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42358368272): baseline test reported `actual: online` when `expected: offline`. This is not a fix. Issue #3 expands this into two further expected-failure tests (obsolete rejection and concurrent reads), with verification pending. |
| Prior experimental wrapper patches | Excluded from PR #1 | Earlier PR branch revisions passed mocked tests; they were removed to enforce one-defect-per-fix work |
| Pending nodes7 handshake cleanup | Source-inspection concern, unproven | [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) |
| Reconnect and stale-read scenarios | **5 named defects reproduced, not fixed** | [PR #6 CI 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004) individually confirms stale status, obsolete rejection, read overlap, obsolete data publication, timer retained on close. Mocked-only. [Issue #3](https://github.com/Missel2/node-red-contrib-s7/issues/3) |
| Actual S7 wire protocol CI | Not tested | [Issue #4](https://github.com/Missel2/node-red-contrib-s7/issues/4) |
| Reproducible package install | Not tested | Inherited lockfile v1 lists different package/dependency versions; smoke job temporarily installs without it. [Issue #5](https://github.com/Missel2/node-red-contrib-s7/issues/5) |
| Siemens CPU/firmware support | Not verified | No PLC or Siemens simulator tests on this branch. [HIL-S7 test matrix](HIL_TEST_MATRIX.md) and [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8) track **future pending** physical CPU tests only |
| Fork npm package | Not released | No publish workflow or release approval |

## Check semantics

- **Wrapper contract (four OS/Node combinations):** positive baseline behavior only, via mocks.
- **Baseline must fail stale-read regression:** expected failure of a named known-defect test on unmodified `red/s7.js`. Green means the fault reproduced, **not** that the behavior passed. After a future #3 fix, change this to a positive regression gate and coordinate required check names.
- **Package dependency smoke:** install and `npm pack --dry-run`, without a coherent lockfile. It is not a reproducible release test.

Record every later test's actual commit SHA, OS, command, workflow URL, fixture version and whether it was run; never state “green CI” without naming its coverage.


### Issue #3 characterization follow-up (2026-11-07; hosted CI verified on commit `1fbd93d`)

- Draft PR #6 expands the expected-failure harness to **five** individually named lifecycle defects: stale successful status, stale rejection, overlapping reads after reconnect, obsolete value publication, and active polling timer on close.
- Positive coalescing of repeated triggers during one unresolved read is added to the passing mocked baseline suite.
- **HIL pending:** HIL-S7-004, HIL-S7-005 and HIL-S7-007; no physical Siemens CPU tested. See [HIL_TEST_MATRIX.md](HIL_TEST_MATRIX.md). These findings are mocks, not protocol or hardware tests.
- Confirmed all five individually named assertions fail as expected (five TAP logs in the baseline-negative-control job) on [GitHub Actions run 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004), commit `1fbd93da39e7f52fc8b9581b417f7ada7a7c328b`. All six required checks passed. The tests are negative characterizations, **not successful behavior regressions or hardware verification**.
