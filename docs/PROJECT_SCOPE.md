# Project scope

**Status:** engineering objectives; not an assertion of present implementation or certification.  
**Established:** 2026-11-06.  
**Code lineage:** [st-one-io/node-red-contrib-s7](https://github.com/st-one-io/node-red-contrib-s7), GPL-3.0-or-later.

## Purpose

Maintain and develop the Node-RED integration for Siemens S7 PLC communication with a focus on:
- predictable connection setup, teardown, retry, disconnection and recovery;
- reliable and distinguishable data value, validity and freshness;
- errors that are classified, reported and available for diagnosis;
- repeatable, automated regression, integration, fault and compatibility testing;
- reproducible builds, dependency traceability and controlled releases;
- behavior and configuration that can be assessed without access to a production PLC.

These are engineering objectives. They do not claim industrial certification, IEC 62443 compliance, functional-safety suitability, or specific CPU/firmware compatibility.

## Scope boundaries

**Initially in scope**
- The existing Node-RED S7 endpoint, input and output behavior and its classical S7 protocol dependency.
- Transport/session lifecycle, timeouts, concurrency, read/write error propagation, bounded resource use and retry behavior.
- Status and diagnostic interfaces usable by Node-RED flows and maintainers.
- Compatibility testing of existing Node-RED flows and configurations.
- Public CI on GitHub-hosted Linux and Windows runners with disposable protocol endpoints, mocks and controlled TCP faults.

**Not assumed by this fork**
- A complete PLC runtime or simulation of machine/process logic.
- Certified safety or deterministic real-time control.
- Compatibility with every Siemens model, firmware, optimized block access, symbolic protocol or PUT/GET security setting.
- A Siemens-endorsed or Siemens-supported package.
- Persistent real PLC connectivity from public CI.
- Automatic installation into productive automation environments.

Access to a real PLC, Siemens PLCSIM Advanced or another manufacturer simulator may be added as separate, licensed and gated verification. Such testing is not a requirement for the first protocol- and connection-level regression tests.

## Operating principles

1. **No silent stale data.** A cached value must not be described as newly read merely because it was republished. Last successful communication, age, validity/quality and endpoint state must be distinguishable when exposed.
2. **Controlled reconnection.** Resource cleanup, backoff, concurrency bounds and recoverability must be explicit and tested. Reconnection must not multiply active sessions without bound.
3. **Safe writes.** Never assume automatic retries of writes are harmless. A lost acknowledgement can leave the outcome unknown; report uncertainty rather than duplicating commands.
4. **Actionable faults.** Logs and Node-RED status/error messages should carry stable, bounded, useful context without credentials or sensitive plant data.
5. **Compatibility first.** Existing Node-RED node types and flows should continue to work, unless an intentional major-version change with a migration path is approved.
6. **Evidence-based claims.** Release notes must differentiate tests against mocks, protocol servers, Siemens simulators and physical PLCs.
7. **Independent stewardship.** Upstream attribution and license remain; changes can be developed and released from this fork without waiting for upstream PR acceptance.

## Relationship to standards

Industrial practices, including relevant IEC 62443 concepts (least privilege, segmentation, change control and logging), can inform implementation and deployment recommendations. This is **not** a claim of conformance, certification or suitability for safety functions.

## Public project communication

Describe verified behavior, constraints, defects and test evidence. Avoid superiority claims about other maintainers, marketing language or unverifiable labels such as “production-ready”, “industrial-grade” or “zero downtime”.

See [Quality policy](QUALITY_POLICY.md), [Test strategy](TEST_STRATEGY.md), [Roadmap](ROADMAP.md) and [Decision log](DECISIONS.md).
