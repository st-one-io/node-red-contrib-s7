# Decision log

Dates describe the time a direction was documented. An accepted direction is not proof of implementation.

## D-001 — Project focus (2026-11-06)

**Decision:** Maintain this downstream fork primarily for diagnosable and repeatable S7 communication behavior, error handling and verifiable releases. Features are secondary. Preserve attribution and GPL requirements. No requirement to submit upstream PRs.

**Not implied:** endorsement by Siemens, certification, production approval or tested reliability.

## D-002 — Initial regression priority (2026-11-06)

**Decision:** First investigate the connection-lifecycle failure previously worked on in a Musashi Node-RED environment. Source patch and runtime evidence must be retrieved and validated. The initial fork uses `@st-one-io/nodes7`; any historical `s7-plus` patch is a separate component and must not be folded into the classic S7 integration without an explicit architecture decision.

**Open:** exact source location, minimal failing case, dependency ownership, correct limits on application-managed sessions.

## D-003 — CI test architecture (2026-11-06)

**Decision:** Prefer disposable, automated protocol and transport tests on GitHub-hosted Ubuntu/Windows runners. Start with an S7-compatible test endpoint and controllable TCP fault injection. A full Siemens PLC runtime is not necessary to test basic connection lifecycle. A protocol fixture does **not** establish Siemens CPU/firmware compatibility.

**Deferred:** supported Siemens simulation/physical test hardware for platform-specific claims. No reliance on evaluation-license resets.

## D-004 — Release boundaries (2026-11-06)

**Decision:** No automatic publication to npm or deployment to production controllers. Establish evidence and compatibility boundaries first. Preserve existing Node-RED behavior where possible, with documented major-version migrations if required.

## D-005 — AI-assisted implementation, human review (2026-11-06)

**Decision:** Disclose that most engineering work can be AI-assisted; the human maintainer determines requirements, evaluates evidence and authorizes substantive merges, live-PLC activity and package releases. Every PR records the actual assistance, tests, risks and rollback path. The Git commit author field is not evidence that each line was written by a human. See [operating model](AI_DEVELOPMENT.md).

## D-006 — Scoped S7 wrapper regression (2026-11-06)

**Decision:** Test and address stale callback and timer cleanup behavior in the Node-RED wrapper first, without conflating this with the Musashi pending-handshake/socket problem inside `@st-one-io/nodes7`. Protocol-level socket cleanup remains P0 and must be independently reproduced and verified.

## D-007 — Public provenance and credits (2026-11-07)

**Decision:** Document upstream origin, original contributors, licenses, direct dependencies and indirect historical influences prominently and with gratitude. Retain the original history and notices. Acknowledgement does not imply external endorsement or industrial certification. See [credits](UPSTREAM_AND_CREDITS.md).

## D-008 — Serialize reads across reconnect (2026-11-07)

**Decision:** Keep ownership of a pending read until its promise settles, even if the transport disconnects and reconnects. Ignore stale results and start at most one coalesced follow-up read after the earlier operation settles. This prioritizes avoiding overlapping operations on the same S7 item group; a permanently unsettled dependency promise can delay recovery and requires a separate dependency-level timeout/cancellation design and tests.

## Open decisions

- Exact dependency-fork strategy for `@st-one-io/nodes7` versus an alternative maintained protocol implementation.
- Minimum supported Node.js/Node-RED versions and dependency pinning policy.
- Final error/status and data-freshness message schema.
- Formal CI reliability thresholds and test duration based on first measurements.
- Whether protocol simulation should be Python/Snap7-based, a custom minimal fixture, or both.
- npm package identity and release-signing/attestation details.

## D-009 — Separate CI/bootstrap from reliability fixes (2026-11-07)

**Decision:** PR #1 establishes AI-assisted maintenance transparency, attribution, task tracking, hosted CI and tests against the unchanged S7 runtime. Its earlier experimental wrapper corrections are explicitly excluded from the final PR diff. Known defects remain tracked in GitHub Issues; first reproduce, then make one narrowly scoped fix. The required “Baseline must fail stale-read regression” check is an **expected-failure characterization**, not a passing repaired-behavior test. Its semantics must be migrated when Issue #3 is fixed. See [work index](WORK_INDEX.md) and [evidence](EVIDENCE.md).


## D-010 — Planned isolated S7-1200 HIL and mandatory per-change test debts (2026-11-07)

**Decision (human maintainer):** A physical Siemens S7-1200 and a RischLab-managed runner are a *future* test level, not a presently available test environment. Every PR names the pending `HIL-S7-*` tests that must run once the bench is available; no HIL outcome may be claimed without hardware evidence. Track cases and safeguards in [HIL_TEST_MATRIX.md](HIL_TEST_MATRIX.md), [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8).

**Safety and security:** Isolation from productive OT networks and outputs, controlled scratch DB, explicit authorization for writes, and trusted-source gating are mandatory. An open-source public PR must not be allowed to run untrusted code on the HIL-capable runner.


## D-011 — Migrate Issue #3 from expected-red to baseline-red/candidate-green (2026-11-07)

**Decision implemented in proposed PR #9; not merged:** Keep the existing `Baseline must fail stale-read regression` job name required by `protect-master` but test the original unchanged wrapper (`e79c15107731e0387d1b3679f2409aef043e87f5`) **and** the new candidate wrapper for each of ten focused lifecycle cases. This guarantees the original defect still reproduces *and* the candidate behavior passes, without prematurely changing a protected branch rule. Run the positive regression suite under `npm test` on Windows/Linux Node 22/24. Mocks alone do not establish actual S7 protocol or Siemens hardware behavior.

**Read ownership:** Keep the ItemGroup read in flight across reconnect until the promise settles; discard results from obsolete connection generations. Coalesce a single follow-up read. A permanently pending dependency promise still prevents forward progress; resolving it safely requires separate test-first transport cancellation/timeout work.

**Transport errors:** An `error` alone need not be a `disconnect`. Preserve polling after a transient error and allow a follow-up read, while discarding old read results. Explicit `disconnect`, `connecting` or close stops polling. This retains the established ability to recover from errors without a new `connect` event.

**Hardware:** HIL-S7-004/-005/-007 all pending. No automatic merge, package publication or real PLC operation.
