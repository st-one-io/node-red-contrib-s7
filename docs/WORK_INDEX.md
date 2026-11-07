# Work index — S7 reliability fork

**Updated:** 2026-11-07. GitHub Issues are enabled. This file is a navigation index; do not duplicate tracked work.

| ID | Priority | Work | State / next |
| --- | --- | --- | --- |
| WI-001 | Completed | [PR #1: AI-assisted process, upstream credits and first CI](https://github.com/Missel2/node-red-contrib-s7/pull/1) | Squash-merged on `master` as `42296d8`; no S7 runtime changes |
| WI-002 | P0 | [Issue #2: pending transport teardown](https://github.com/Missel2/node-red-contrib-s7/issues/2) | Hypothesis from source inspection; test first |
| WI-003 | P0 | [Issue #3 / PR #6: stale reads and reconnect overlap](https://github.com/Missel2/node-red-contrib-s7/pull/6) | Five individually reproduced negative cases and one positive trigger-coalescing test; [CI run 42375597004](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42375597004). **Not repaired.** |
| WI-004 | P1 | [Issue #4: disposable S7 protocol endpoint](https://github.com/Missel2/node-red-contrib-s7/issues/4) | Wire-protocol CI not yet implemented |
| WI-005 | P1 | [Issue #5: reproducible npm lockfile](https://github.com/Missel2/node-red-contrib-s7/issues/5) | Current inherited lockfile stale; release gate missing |
| WI-006 | P2 | Data freshness, diagnostics and uncertain writes | Requirements only; do not implement before reliability baseline |
| WI-007 | P1 future | [Issue #8: isolated S7-1200 HIL + test-debt tracking](https://github.com/Missel2/node-red-contrib-s7/issues/8) | Hardware absent; `HIL-S7-*` test matrix is pending and required in all new PR descriptions |

## Continuation rules

Review open PRs, CI and issues before starting new work. Test one defect before patching it. The current expected-failing stale-read check is a **characterization**: it should be replaced with a passing regression after fixing #3, with any associated branch ruleset check name updated deliberately. Passing mock checks do not establish real S7 compatibility.

Never automatically merge, publish packages or access a production PLC.
