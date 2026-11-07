# Planned Siemens S7-1200 hardware-in-the-loop verification matrix

**State: PENDING_HARDWARE (2026-11-07).** No physical S7-1200 is installed or authorized for the fork CI yet. All rows are *future test obligations*, **not tests executed or passed**. Follow [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8).

## Mandatory change/PR traceability

Every development PR must explicitly list relevant IDs below (and add cases when needed) and state the HIL execution state. Use the [pull request template](../.github/pull_request_template.md); `HIL: not applicable` needs a reason. Retain the pending cases when merging or making later improvements; do not mark a row verified simply because mock or simulated-wire CI passes.

## Required environment and authorization (before first run)

- Dedicated, isolated S7-1200 **not connected to any machinery**, physical outputs or productive OT network; network policy routes to TCP/102 from only a dedicated test runner. Never expose TCP/102 to the internet.
- Record exact CPU order number, firmware, security setting, TIA project and test-program SHA (all currently TBD). PUT/GET and nonoptimized access are enabled only where necessary for classic S7.
- Use a **synthetic, non-optimized scratch DB** for all permitted reads/writes. No hardware outputs, process-control command words or unsafe values. Agree on a bounded write whitelist and known initial/restore values.
- Public PR code does not get to execute on the network-accessible runner. Run only approved commits using a manually gated or separately reviewed workflow and protected infrastructure; store no SPS IPs, topology, secrets or binaries in public logs.
- Require an explicit operator approval for physical write tests and destructive/fault tests; verify preflight state, timed cleanup, post-test reset and safe stop.
- A HIL result is only `VERIFIED_HARDWARE` when the log links a commit SHA, CPU/firmware, test-program revision, exact case ID, date/operator, and before/after state. A different firmware or revision needs fresh evidence.

## Pending test cases

| Case ID | Planned physical S7-1200 verification | Prerequisite | Related work | Status |
| --- | --- | --- | --- | --- |
| HIL-S7-001 | Classic S7 PUT/GET connection handshake; connect, decline invalid endpoint, disconnect | Authorized isolated CPU, read only | #2, #4 | **PENDING_HARDWARE** |
| HIL-S7-002 | Read isolated synthetic DB; BOOL, BYTE, INT and REAL representation, byte offsets and freshness | Test DB populated and checked; read only | #4, #7 | **PENDING_HARDWARE** |
| HIL-S7-003 | Write then read back only allowlisted scratch DB values; verify exact bytes and reset | **Separate approval for writes**, no I/O effect | #4, #7 | **PENDING_HARDWARE** |
| HIL-S7-004 | Disconnect/reconnect while a read is pending; old result/error cannot resurrect stale state or publish obsolete data | Controlled lab network fault; read only | #3, PR #6 | **PENDING_HARDWARE** |
| HIL-S7-005 | Repeated reconnect and timeout cycles: bounded retry, no duplicated sessions, restored status | Rate-limited, controlled network faults | #2, #3, #4 | **PENDING_HARDWARE** |
| HIL-S7-006 | Ambiguous write acknowledgment: no unapproved automatic retry or duplicate write | **Separate write/fault approval**, safe scratch DB, post-check | #7 | **PENDING_HARDWARE** |
| HIL-S7-007 | Node-RED redeploy, close and shutdown: timers/resources released; reconnect possible afterward | Test flow with no physical outputs | #3, #7 | **PENDING_HARDWARE** |

## Evidence log

_No real-hardware runs recorded. Do not enter mock or simulator evidence here as HIL._

The [verification ledger](EVIDENCE.md) tracks non-hardware CI evidence. New firmware families or CPU types need separate compatibility claims.
