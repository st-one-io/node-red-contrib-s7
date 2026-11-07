# Roadmap and next verified work

**Status date:** 2026-11-06. This is an ordered engineering plan, not a delivery claim. Work state must be updated from code, PRs and CI logs at the time of each change.

## P0 — Reproduce the previously investigated Musashi connection fault

**First technical priority.** Do not start with feature development or a large protocol rewrite. PR #1 is limited to CI/documentation and baseline tests; no S7 runtime patch is included. [Issue #3](https://github.com/Missel2/node-red-contrib-s7/issues/3) tracks wrapper characterization, and [Issue #2](https://github.com/Missel2/node-red-contrib-s7/issues/2) tracks the separate pending COTP/transport teardown hypothesis. See [Musashi investigation](MUSASHI_CONNECTION_REGRESSION.md) and [evidence ledger](EVIDENCE.md). Apply targeted patches only after reproducing a failure.

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
