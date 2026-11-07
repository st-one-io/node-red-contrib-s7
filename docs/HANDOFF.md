
# Development handoff

**Updated:** 2026-11-07. Confirm GitHub branch/CI state before further work.

## Baseline

- PR #6 [merged](https://github.com/Missel2/node-red-contrib-s7/pull/6) into `master` at `e79c15107731e0387d1b3679f2409aef043e87f5`; post-merge [CI 42377654001](https://github.com/Missel2/node-red-contrib-s7/actions/runs/42377654001) 6/6 success. That green CI confirmed **five known failing desired-behavior checks** on the unmodified runtime; no bug fix.
- Issue #3 follow-up branch `fix/issue-3-session-owned-read-lifecycle` contains the candidate lifecycle fix and a test-gate conversion. **Do not claim this fix verified until a green CI run on the exact head SHA.**
- No new dependency/protocol implementation. Lockfile still stale (#5); independent S7 wire fixture still outstanding (#4); separate pending COTP transport teardown (#2).

## Candidate lifecycle change / limitations

- Pending ItemGroup read ownership retained through disconnect/reconnect; per-connection generation marks late success/rejection stale; old values do not publish.
- Stop/close cancels polling timer and makes close callback complete even if disconnect rejects; repeated read requests coalesce. Keep disabled cycle interval through reconnect.
- **Known limitation:** an `@st-one-io/nodes7` read promise that never settles still blocks subsequent reads on the same item group. True transport abort/recreation belongs to an independent, test-first dependency strategy; do not silently overlap operations.
- Existing required check `Baseline must fail stale-read regression` is retained for branch ruleset continuity. It now checks seven assertions **red against frozen original master `e79c151` AND green against proposed corrected wrapper**. Five were characterized in PR #6, five are added as negative controls here (including disabled polling, post-close events and a transient transport-error retry without a disconnect). `npm test` must now run positive corrected lifecycle checks.
- Only mock Node-RED/transport tests have run, no actual wire, Siemens simulator or physical S7-1200 tests.

## Future hardware testing

- [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8), [HIL matrix](HIL_TEST_MATRIX.md): HIL-S7-004/005/007 **PENDING_HARDWARE**. No physical CPU or test-runner available; no real PLC interaction permitted.
- Only trusted, approved hardware tests on isolated runner with explicit safety checks, and separate approval for physical writes.

## Next

1. Inspect actual branch head, current CI (all six jobs) and the patch; fix failures without weakening negative control or regression expectations.
2. Provide human review and merge decision for the scoped Issue #3 fix PR; **no unattended merge**.
3. Then continue #4 (wire fixture), #5 (reproducible lockfile) and #2 (pending handshake teardown) separately.

## No-go boundaries

Do not auto-merge, publish to npm, deploy to production OT or use real PLCs without explicit authorization.
