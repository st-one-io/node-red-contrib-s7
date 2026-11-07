# Engineering and quality policy

**Document type:** acceptance policy and design targets, not current test results.

## Test-first rule

For connection reliability changes, first reproduce a fault against an identified baseline with a deterministic test. Keep the failing behavior and test evidence independent from the fix. An expected-failure characterization that passes a CI gate proves only that the baseline defect still reproduces. Migrate that gate to a passing regression before claiming resolution. One PR should target one coherent defect unless dependencies make separation impossible.

## Evidence and reporting

Every material change should include: affected behavior; expected and observed failure before the change; a reproducible test; dependencies and runtime versions; commit and CI links; and known limitations. The following states must not be conflated:

- **Proposed:** documented, not implemented.
- **Implemented:** code exists, execution not yet verified.
- **CI-verified:** specified automated tests passed on a named commit.
- **Simulator-verified:** behavior tested against a named protocol/server simulator and version.
- **Hardware-verified:** tested against named CPU family, firmware and test configuration.
- **Released:** a versioned, traceable artifact has been published.

## Connection lifecycle

- Explicit states for idle, connecting, online, reconnecting, degraded, disconnected and stopped as applicable; exact public state names require an interface decision.
- Bounded connection attempts and timers, no duplicated reconnect loops, no unbounded file-descriptor/socket growth.
- Predictable cleanup on errors, shutdown and redeploy; test for partial handshake, half-open connection, read timeout and peer termination.
- Error reporting remains available if the endpoint is offline; errors are not reduced to an endlessly repeated generic “not connected”.
- Connection-limits must be defined for a concrete scope (process, endpoint and peer). The initial proposed design constraint is **no more than two simultaneously active application-managed TCP sessions per endpoint**. This requires validation against the actual transport design, not a blanket claim about OS TCP states.
- Backoff and jitter must be bounded and visible; cancellation must stop pending work.

## Read semantics and data quality

- Differentiate last successfully read value, last emitted value, last successful read timestamp and last connection activity.
- Do not refresh a PLC-read timestamp when a cached value is republished.
- Define behavior for never-initialized, stale, disconnected and invalid-address values.
- Avoid high-frequency duplicate downstream messages by separating optional publish interval from PLC read interval where such functionality is introduced.
- Check data types, addressing, length and range, and attribute failures to a variable where the underlying protocol permits.

## Write semantics

- Writes need bounded queues, bounded timeouts and explicit success/error/unknown-result handling.
- No automatic replay of non-idempotent writes or ambiguous write results unless an explicit, reviewed policy makes it safe for the specific operation.
- Never allow tests to write to production controllers. Hardware tests require an authorized test PLC, safe addressing and a rollback/stop plan.

## Observability

- Structured, consistently named error identifiers; endpoint/operation context; phase, attempt number and timestamp; severity and retryability where determinable.
- Node-RED status and catch/error pathways should expose actionable high-level states.
- Optional verbose debug logs must be bounded, off by default in deployed environments and redact credentials, PLC payloads and plant identifiers unless explicitly enabled in an authorized environment.
- Metrics of reconnects, active sessions, failed operations, latency and data age should be specified and tested before a stability claim.
- Diagnostic artifacts must describe what was collected and the limits of interpretation.

## Build and release controls

- All changes must be evaluated against current CI; missing checks are not passing checks.
- CI should cover lint/static checks, unit tests, protocol integration, deterministic network faults, and selected Windows/Linux/Node.js compatibility combinations.
- Pin or control dependencies, review security advisories, preserve licenses and create traceable artifacts.
- Release candidates require declared compatibility matrix, known issues, reproducible build evidence and rollback guidance.
- Default policy: no automatic npm publishing, no production deployment, no unsupervised real-PLC write tests.
- No numerical reliability guarantee (uptime, mean time to recovery, coverage percentage) is asserted until the measurement method and observed evidence are documented.

These policies are targets for staged adoption; [Roadmap](ROADMAP.md) distinguishes initial gaps from delivered work.
