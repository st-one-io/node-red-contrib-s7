# Decision log

Dates describe the time a direction was documented. An accepted direction is not proof of implementation.

## D-001 — Project focus (2026-11-06)

**Decision:** Maintain this downstream fork primarily for diagnosable and repeatable S7 communication behavior, error handling and verifiable releases. Features are secondary. Preserve attribution and GPL requirements. No requirement to submit upstream PRs.

**Not implied:** endorsement by Siemens, certification, production approval or tested reliability.

## D-002 — Initial regression priority (2026-11-06)

**Decision:** First investigate the connection-lifecycle failure previously worked on in a Musashi Node-RED environment. Source patch and runtime evidence must be retrieved and validated. The initial fork uses \`@st-one-io/nodes7\`; any historical \`s7-plus\` patch is a separate component and must not be folded into the classic S7 integration without an explicit architecture decision.

**Open:** exact source location, minimal failing case, dependency ownership, correct limits on application-managed sessions.

## D-003 — CI test architecture (2026-11-06)

**Decision:** Prefer disposable, automated protocol and transport tests on GitHub-hosted Ubuntu/Windows runners. Start with an S7-compatible test endpoint and controllable TCP fault injection. A full Siemens PLC runtime is not necessary to test basic connection lifecycle. A protocol fixture does **not** establish Siemens CPU/firmware compatibility.

**Deferred:** supported Siemens simulation/physical test hardware for platform-specific claims. No reliance on evaluation-license resets.

## D-004 — Release boundaries (2026-11-06)

**Decision:** No automatic publication to npm or deployment to production controllers. Establish evidence and compatibility boundaries first. Preserve existing Node-RED behavior where possible, with documented major-version migrations if required.

## Open decisions

- Exact dependency-fork strategy for \`@st-one-io/nodes7\` versus an alternative maintained protocol implementation.
- Minimum supported Node.js/Node-RED versions and dependency pinning policy.
- Final error/status and data-freshness message schema.
- Formal CI reliability thresholds and test duration based on first measurements.
- Whether protocol simulation should be Python/Snap7-based, a custom minimal fixture, or both.
- npm package identity and release-signing/attestation details.
