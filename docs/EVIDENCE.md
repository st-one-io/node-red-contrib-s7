# Verification ledger

**Updated:** 2026-11-07. A green status check is evidence only for its named assertion and the exact commit tested.

| Item | Status | Evidence / limitations |
| --- | --- | --- |
| Upstream runtime | Preserved in merged PRs #1 and #6 | Current `master` retains the original wrapper; PR #9 proposes an explicit, separate code change, not merged |
| Project governance and credits | Merged in PR #1 | Public AI-assisted workflow, upstream credits, GitHub issue/PR tracking and active required checks on protected `master` |
| Baseline wrapper behavior | CI-verified in PRs #1/#6 and proposed PR #9 | Five baseline Node-RED mock tests, including repeated-trigger coalescing, passed against PR #9 candidate. No real S7 transport. [CI 42378583520](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378583520) |
| Stale read after disconnect | Baseline defect reproduced; PR #9 patch proposed | Five confirmed negative cases from PR #6 plus five new controls: ten cases are red on pinned master `e79c151` and green on candidate `64d3d33`. [CI 42378583520](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378583520). Mock-only, not vendor verified |
| Prior experimental wrapper patches | Excluded from PR #1 | Earlier PR branch revisions passed mocked tests; they were removed to enforce one-defect-per-fix work |
| Pending nodes7 handshake cleanup | Source-inspection concern, unproven | [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) |
| Reconnect and stale-read scenarios | Candidate corrected in PR #9, NOT merged | [PR #9 CI 42378583520](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378583520): ten desired-behavior assertions individually red on immutable original, green on candidate, on mock fixtures. Transport and hardware limitations remain; see [Issue #3](https://github.com/Missel2/node-red-contrib-s7/issues/3) |
| Actual S7 wire protocol CI | Not tested | [Issue #4](https://github.com/Missel2/node-red-contrib-s7/issues/4) |
| Reproducible package install | Not tested | Inherited lockfile v1 lists different package/dependency versions; smoke job temporarily installs without it. [Issue #5](https://github.com/Missel2/node-red-contrib-s7/issues/5) |
| Siemens CPU/firmware support | Not verified | No PLC or Siemens simulator tests on this branch. [HIL-S7 test matrix](HIL_TEST_MATRIX.md) and [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8) track **future pending** physical CPU tests only |
| Fork npm package | Not released | No publish workflow or release approval |

## Check semantics

- **Wrapper contract (four OS/Node combinations):** baseline AND positive lifecycle regression assertions on the **candidate** wrapper, via mocks.
- **Baseline must fail stale-read regression:** historical protected-branch check name preserved deliberately. On PR #9 it verifies **ten assertion failures on pinned original `e79c151` AND ten passes on candidate code**; green means red-before/green-after was proven on mocks. On current master before this PR is merged, it still checks only baseline expected failures. After a merge, its semantics will change without breaking the configured required check name.
- **Package dependency smoke:** install and `npm pack --dry-run`, without a coherent lockfile. It is not a reproducible release test.

Record every later test's actual commit SHA, OS, command, workflow URL, fixture version and whether it was run; never state “green CI” without naming its coverage.


### Issue #3 characterization follow-up (2026-11-07; hosted CI verified on commit `1fbd93d`)

- Draft PR #6 expands the expected-failure harness to **five** individually named lifecycle defects: stale successful status, stale rejection, overlapping reads after reconnect, obsolete value publication, and active polling timer on close.
- Positive coalescing of repeated triggers during one unresolved read is added to the passing mocked baseline suite.
- **HIL pending:** HIL-S7-004, HIL-S7-005 and HIL-S7-007; no physical Siemens CPU tested. See [HIL_TEST_MATRIX.md](HIL_TEST_MATRIX.md). These findings are mocks, not protocol or hardware tests.
- Confirmed all five individually named assertions fail as expected (five TAP logs in the baseline-negative-control job) on [GitHub Actions run 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004), commit `1fbd93da39e7f52fc8b9581b417f7ada7a7c328b`. All six required checks passed. The tests are negative characterizations, **not successful behavior regressions or hardware verification**.


### Issue #3 candidate fix (2026-11-07; candidate CI verified on `64d3d33`, final head pending)

- Candidate branch `fix/issue-3-session-owned-read-lifecycle` changes read lifecycle ownership by session generation and invalidates stale read callbacks. A pending read stays exclusive to the ItemGroup until settled, so on reconnect no overlapping read is started. Timers stop on disconnect/close; close completion errors are observable.
- Ten named lifecycle tests must PASS on corrected code. The protected required check **retains its historical name** but verifies each assertion fails on the pinned, original `e79c151` runtime and passes on the current candidate.
- `npm test` must run passing baseline and lifecycle tests on Windows/Linux Node 22/24. This is mocked behavior only.
- [CI 42378583520](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378583520) passed all six required jobs on candidate `64d3d33a67d99e3eb6e89691f01e025624a0cb15`. Recheck CI on any later documentation/test-only head before merging.
- **Unverified:** real S7 wire/session teardown and socket counts; HIL-S7-004/005/007 pending; an endlessly unresolved ItemGroup read may still block recovery. Do not claim vendor firmware compatibility.

- [Initial proposed fix CI 42378264839](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378264839) passed 6/6 on `d16c65a34dae53fe5ddcac808a46851e3d1ed0ec`; each of the seven desired-behavior tests failed on original `e79c151` and passed on the corrected runtime, plus five positive baseline tests on Windows/Linux.
- Follow-up added three more red-before/green-after edge cases: disabled polling through reconnect, late connect/read after close and transient transport error without disconnect. [CI 42378583520](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42378583520) verified all ten controls on commit `64d3d33`.

- Compatibility refinement: a transport `error` alone does not imply `disconnect`. Preserve polling, discard the pending result and coalesce one fresh retry; verified on candidate commit `64d3d33` via a failing original baseline control. No claim of actual wire behavior.
