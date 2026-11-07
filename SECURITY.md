# Security Policy

## Project Status

This repository is an independently maintained, AI-assisted fork of [node-red-contrib-s7](https://github.com/st-one-io/node-red-contrib-s7).

The project focuses on improving connection reliability, protocol interoperability, error handling, and test coverage for Siemens S7 communication in Node-RED.

**The fork is currently under active development and is not considered production-ready or industrial safety-certified.**

The inherited package version is `3.1.3`. It does not represent a separately published, security-supported release of this fork.

## Supported Versions

| Version / Branch | Security Support |
| --- | --- |
| `master` (development branch) | Best-effort security investigation and fixes |
| Unreleased development branches | No independent security support |
| Fork version `3.1.3` | No stable security support commitment |
| Original upstream releases | Maintained according to upstream policy |

There is currently no guaranteed security update schedule or formal support SLA.

Security fixes are evaluated according to their severity, reproducibility, and potential impact.

## Reporting a Vulnerability

**Please do not disclose security vulnerabilities through public GitHub Issues, Pull Requests, or Discussions.**

Use GitHub's private vulnerability reporting feature:

[Report a vulnerability privately](https://github.com/Missel2/node-red-contrib-s7/security/advisories/new)

When submitting a report, please include:

- A description of the vulnerability and its potential impact.
- Affected versions, branches, or commit hashes.
- Steps to reproduce the issue.
- A minimal proof of concept, if available.
- Suggested mitigations or fixes, if known.

Do not include production PLC credentials, private network information, or other sensitive operational data.

## Vulnerability Handling

Reported vulnerabilities will be assessed on a best-effort basis.

The general process is:

1. Review the report and determine whether it affects this fork.
2. Assess severity, exploitability, and potential industrial impact.
3. Reproduce the issue in an isolated test environment.
4. Develop and verify a fix where appropriate.
5. Coordinate disclosure and publication of a security advisory when necessary.

There are currently no guaranteed response or remediation times.

Reports affecting upstream dependencies may be referred to the corresponding maintainers.

## Industrial Control System Safety

This software communicates with industrial control systems and must be treated accordingly.

- Never test vulnerabilities against production PLCs without explicit authorization.
- Prefer isolated, disposable protocol test environments.
- Physical PLC testing must use an authorized, isolated test setup.
- PLC write operations require appropriate safeguards and explicit authorization.
- Successful automated tests do not constitute certification for industrial or safety-critical operation.

## Responsible Disclosure

We encourage responsible, coordinated disclosure of security vulnerabilities.

Please allow reasonable time for investigation and remediation before publishing exploit details.

## Development and Security Practices

The project aims to maintain:

- Protected branches and mandatory CI checks.
- Automated dependency vulnerability monitoring.
- Secret scanning and code security analysis.
- Reproducible regression testing.
- Dedicated protocol and fault-injection tests.
- Human approval for merges and releases.
- Explicit tracking of tests requiring physical Siemens hardware.

AI-assisted contributions are subject to the same review and verification requirements as other contributions.

Security improvements and findings are tracked through GitHub Issues and security advisories as appropriate.

---

**Maintainer:** [Missel2](https://github.com/Missel2)

**Repository:** [Missel2/node-red-contrib-s7](https://github.com/Missel2/node-red-contrib-s7)
