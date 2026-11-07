## Purpose and scope

Related issue(s):
Change to runtime/protocol, tests, CI, docs:

## Verification on exact head commit

- [ ] Unit/contract tests: commit, OS/Node version, commands and CI URL
- [ ] Wire/protocol fixture tests: version and outcome (or `not run`)
- [ ] Negative control: expected failure before fix and positive verification afterward (or reason N/A)
- [ ] Security/compatibility risks, rollback and unverified scenarios documented

## Future physical S7-1200 hardware test applicability (mandatory)

Refer to [HIL_TEST_MATRIX.md](../docs/HIL_TEST_MATRIX.md) and [Issue #8](https://github.com/Missel2/node-red-contrib-s7/issues/8).

**HIL:** `PENDING_HARDWARE: HIL-S7-...` / `not applicable: <concrete reason>`

**Real S7-1200 tests executed:** No (hardware not yet available). A green mock/simulator check does not count as a hardware pass.

**Required later:** Describe each case and the safe controlled action on the physical test CPU. Add new HIL case IDs to the matrix if the existing ones do not cover the change.

## AI assistance and operating boundaries

AI assistance:
No automatic merge, npm publication, productive PLC tests, or unrestricted real-PLC write operations.
