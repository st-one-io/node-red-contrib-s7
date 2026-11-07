# Roadmap and next verified work

**Status date:** 2026-11-07. This is an ordered engineering plan, not a delivery claim. Work state must be updated from code, PRs and CI logs at the time of each change.

## P0 — Reproduce the previously investigated Musashi connection fault

**First technical priority.** Do not start with feature development or a large protocol rewrite. The CI/bootstrap PR #1 has been squash-merged without S7 runtime changes; draft PR #6 now holds expanded **expected-failing characterization tests**, not a runtime patch. [Issue #3](https://github.com/Missel2/node-red-contrib-s7/issues/3) tracks wrapper characterization, and [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) tracks the separate pending COTP/transport teardown hypothesis. See [Musashi investigation](MUSASHI_CONNECTION_REGRESSION.md) and [evidence ledger](EVIDENCE.md). Apply targeted patches only after reproducing a failure.

- [ ] Locate the actual Musashi Node-RED image patch/source, its origin commit and failure evidence.
- [ ] Separate `@st-one-io/nodes7` / classical S7 code from any independent `s7-plus` changes.
- [ ] Create a minimal failing test for a failed or interrupted connection and resource cleanup.
- [ ] Record connection/session counts, retry cycles, timing and diagnostic events.
- [ ] Apply the minimum reviewed correction at the right layer; decide whether it belongs in this fork, a maintained protocol dependency fork or both.
- [ ] Demonstrate fail-before/pass-after on identified commits and verify no write regression.
- [ ] Preserve the analysis, test fixture and results in the repository.

**Exit evidence:** reproducible fault and traceable passing regression on the corrected commit. Prior image-level verification is not equivalent to this exit criterion.

## P1 — CI baseline and disposable protocol endpoint

- [ ] Select and pin supported Node.js/Node-RED platforms.
- [ ] Replace the current failing `npm test` placeholder with real automated tests.
- [ ] Verify an S7-compatible server/fixture on GitHub-hosted Ubuntu and Windows runners.
- [ ] Test TCP fault injection and ensure the workflow fails if the server cannot start.
- [ ] Add static analysis, dependency/security checks and redacted downloadable diagnostics.
- [ ] Record covered protocol operations and fixture limitations.

**Exit evidence:** green CI on a named commit, confirmed read/write and connection recovery behavior against the named fixture; unsupported scenarios documented.

## P2 — Connection and data-quality behavior

- [ ] Define explicit connection state model, error identifiers and diagnostic schema.
- [ ] Bound reconnect/backoff, concurrent sessions and queued work.
- [ ] Expose last successful read, value age/quality and disconnected/stale states.
- [ ] Define behavior and tests for invalid addresses, read failures and ambiguous write results.
- [ ] Test redeploy, shutdown, repeated faults and sustained recovery for leaks.

**Exit evidence:** specified and tested behavior, not merely absence of observed errors.

## P2H — Future isolated physical S7-1200 verification ([Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8))

**Planned, not deployed and not run.** The maintainer intends to provide a dedicated S7-1200 reachable only through an isolated RischLab hardware-in-the-loop test runner. Continue mock and disposable protocol CI while awaiting hardware.

- [ ] Identify the exact CPU order number, firmware and a dedicated test PLC program with a non-optimized scratch DB and no physical I/O effects.
- [ ] Approve topology, TCP/102 egress constraints, test-data addresses, power/reset and safe read/write procedures.
- [ ] Run only trusted, approved source revisions against the hardware; do not expose the test runner or PLC to arbitrary public PR code.
- [ ] For **every development PR**, mark required future tests by stable `HIL-S7-*` IDs from [HIL_TEST_MATRIX.md](HIL_TEST_MATRIX.md). Pending means **not executed**, even if mocked tests are green.
- [ ] Create a separately authorized, gated HIL workflow with evidence (CPU, firmware, project SHA, commit SHA, test logs), after the bench is available.

**Exit evidence:** verified runs on the named S7-1200 with safe setup and reset. Until then all HIL cases remain pending.

## P3 — Compatibility and controlled releases

- [ ] Preserve existing Node-RED node types/settings or publish tested migration instructions.
- [ ] Specify supported Node.js/Node-RED and classic S7 CPU/protocol test matrix.
- [ ] Implement versioned release candidates, change log, dependency bill of materials as appropriate, and rollback notes.
- [ ] Evaluate hardware-in-the-loop or supported Siemens simulation for vendor-specific claims.
- [ ] Define publication identity/name before any npm release to avoid confusion with the upstream package.

**Exit evidence:** traceable release candidate with documented verification boundaries.

## P4 — Additional functionality after reliability baseline

Candidates for separate design decisions and issues:
- independently configurable publish intervals without additional PLC polling;
- optional publish-on-change, freshness metadata and reconnect-event output;
- targeted per-variable failure diagnostics;
- import and validation of variable definitions;
- clearer Node-RED editor status and debug information.

New functionality must not bypass P0/P1 reliability work.

## Maintainer continuation rule

Start every development round by checking the current default branch, issues, active PRs and CI. Continue unfinished work before creating overlapping branches. Update this roadmap with actual evidence and outstanding gaps. Never convert a design target into a statement of achieved reliability.
