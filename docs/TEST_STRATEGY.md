# Test strategy

**Goal:** test the Node-RED S7 integration's protocol and connection behavior without requiring a complete PLC process simulation on each change.

## Layers and confidence

| Layer | Environment | Test focus | What it cannot establish |
| --- | --- | --- | --- |
| Unit | Node.js, mocks | Lifecycle state transitions, timers, error classification, read/write queue behavior | Wire/protocol interoperability |
| Protocol CI | Disposable S7-compatible server and Node-RED/client | Connection setup, reads, writes, reconnect and wire-visible errors | Vendor firmware compatibility |
| Fault injection | Controllable TCP proxy/server | Partial handshake, abrupt close, reset, blackhole/timeouts, slow response, repeated failures | Full behavior of every real network |
| Optional vendor simulation | Licensed and supported Siemens environment | Documented Siemens simulator behavior | All physical CPU/firmware variants |
| Hardware-in-the-loop | Isolated, authorized test PLC | Named CPU/firmware behaviors and endurance | Universal compatibility |

Each layer must identify the exact fixture/software version and the tested commit. A protocol test double is not a Siemens PLC.

## Initial GitHub-hosted CI proof of concept

1. Run on Linux and Windows GitHub-hosted runners with supported Node.js versions and an independently started S7-compatible local server.
2. Verify actual S7 handshake and successful read/write against known test addresses; use a nonprivileged local test port where supported.
3. Add a controllable fault proxy so a test can forcibly stop/reset a connection during setup and a read without relying on undocumented simulator behavior.
4. Capture active application-managed socket counts, state changes, failure/recovery events and bounded logs.
5. Repeat faults enough to detect resource leaks; use deterministic assertions and collect run-to-run metrics rather than selecting an arbitrary pass threshold.
6. Shut down all child processes; upload redacted logs and machine-readable test results even for failed runs.
7. Fail CI on violated behavior or a test harness that did not start correctly. No silent skip counts as success.

Candidate fixture: a Python/Snap7-derived S7 server or a dedicated deterministic protocol fixture. Its protocol coverage, licensing, runner compatibility and ability to inject the required failures must be verified before selection. Use plain TCP mocks for purely transport-level failures; do not overstate those tests as S7 protocol validation.

## Priority regression: Musashi connection lifecycle

Prior work reported socket/resource cleanup and reconnection faults in a Node-RED deployment. The exact patch provenance and relevant dependency have **not yet been independently verified in this repository**. First locate and review the source patch, deployment/container changes and any available logs. Distinguish classic `nodes7` from the separate `s7-plus` stack. Do not merge unrelated protocol changes.

Expected regression sequence:
1. Identify an affected baseline revision and a deterministic trigger.
2. Demonstrate the failure on the baseline.
3. Observe socket/session and error-state behavior while the peer fails or restarts.
4. Apply the smallest justified correction to the correct dependency or integration layer.
5. Demonstrate that the same regression passes on the corrected commit.
6. Confirm that reads, writes, redeploy/shutdown and normal reconnect remain functional.
7. Preserve test output and document what remains unverified on actual hardware.

## Release validation

- At each PR: fast unit checks, key connection fault regression and baseline protocol tests.
- At scheduled/RC validation: extended recovery/stress runs, supported OS/Node-RED compatibility matrix, dependency scanning and packaging.
- Before asserting compatibility with a Siemens CPU family/firmware: simulator or test hardware evidence specific to that claim.
- Before operational use: plant owner approval, network security assessment and read/write risk evaluation.

Windows is useful to check platform compatibility, but a Windows runner is not itself evidence of Siemens PLCSIM compatibility. No trial-license reset, license bypass or assumed “PLCSIM Light” capability is part of the CI architecture.
