# Work index — S7 reliability fork

**Updated:** 2026-11-07. GitHub Issues are enabled. This file is a navigation index; do not duplicate tracked work.

| ID | Priority | Work | State / next |
| --- | --- | --- | --- |
| WI-001 | P0 | [PR #1: AI-assisted process, upstream credits and first CI](https://github.com/Missel2/node-red-contrib-s7/pull/1) | Narrowed to **no runtime changes**; verify final six checks and seek human merge decision |
| WI-002 | P0 | [Issue #2: pending transport teardown](https://github.com/Missel2/node-red-contrib-s7/issues/2) | Hypothesis from source inspection; test first |
| WI-003 | P0 | [Issue #3: stale reads and reconnect overlap](https://github.com/Missel2/node-red-contrib-s7/issues/3) | First expected failure reproduced; add targeted cases before a fix PR |
| WI-004 | P1 | [Issue #4: disposable S7 protocol endpoint](https://github.com/Missel2/node-red-contrib-s7/issues/4) | Wire-protocol CI not yet implemented |
| WI-005 | P1 | [Issue #5: reproducible npm lockfile](https://github.com/Missel2/node-red-contrib-s7/issues/5) | Current inherited lockfile stale; release gate missing |
| WI-006 | P2 | Data freshness, diagnostics and uncertain writes | Requirements only; do not implement before reliability baseline |

## Continuation rules

Review open PRs, CI and issues before starting new work. Test one defect before patching it. The current expected-failing stale-read check is a **characterization**: it should be replaced with a passing regression after fixing #3, with any associated branch ruleset check name updated deliberately. Passing mock checks do not establish real S7 compatibility.

Never automatically merge, publish packages or access a production PLC.
