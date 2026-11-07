# Verification ledger

**Updated:** 2026-11-07. A green status check is evidence only for its named assertion and the exact commit tested.

| Item | Status | Evidence / limitations |
| --- | --- | --- |
| Upstream runtime | Preserved in PR #1 | `red/s7.js` is restored to the current fork master content; no connection bugfix in the proposed bootstrap diff |
| Project governance and credits | Proposed in PR #1 | Public AI-assisted workflow, license/author links, GitHub tasks and branch review rules |
| Baseline wrapper behavior | Added, verification pending on final head | Four isolated Node-RED wrapper tests; `nodes7` is stubbed |
| Stale read after disconnect | **Confirmed bug reproduction** | [Initial expected-failure check, CI 42358368272](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42358368272): baseline test reported `actual: online` when `expected: offline`. This is not a fix |
| Prior experimental wrapper patches | Excluded from PR #1 | Earlier PR branch revisions passed mocked tests; they were removed to enforce one-defect-per-fix work |
| Pending nodes7 handshake cleanup | Source-inspection concern, unproven | [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) |
| Reconnect and stale-read scenarios | Test design underway, not fixed | [Issue #3](https://github.com/Missel2/node-red-contrib-s7/issues/3) |
| Actual S7 wire protocol CI | Not tested | [Issue #4](https://github.com/Missel2/node-red-contrib-s7/issues/4) |
| Reproducible package install | Not tested | Inherited lockfile v1 lists different package/dependency versions; smoke job temporarily installs without it. [Issue #5](https://github.com/Missel2/node-red-contrib-s7/issues/5) |
| Siemens CPU/firmware support | Not verified | No PLC or Siemens simulator tests on this branch |
| Fork npm package | Not released | No publish workflow or release approval |

## Check semantics

- **Wrapper contract (four OS/Node combinations):** positive baseline behavior only, via mocks.
- **Baseline must fail stale-read regression:** expected failure of a named known-defect test on unmodified `red/s7.js`. Green means the fault reproduced, **not** that the behavior passed. After a future #3 fix, change this to a positive regression gate and coordinate required check names.
- **Package dependency smoke:** install and `npm pack --dry-run`, without a coherent lockfile. It is not a reproducible release test.

Record every later test's actual commit SHA, OS, command, workflow URL, fixture version and whether it was run; never state “green CI” without naming its coverage.
