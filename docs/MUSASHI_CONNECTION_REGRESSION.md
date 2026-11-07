# Musashi connection regression (P0)

**Evidence class:** historical engineering lead; not a verified patch in this fork.

Prior Musashi work identified a potential S7 protocol defect: after a failed or interrupted ISO-on-TCP/COTP handshake, an in-progress transport can remain outside the usual active-connection cleanup path. Reconnect attempts may then accumulate resources. A patched container was previously built and inspected, but that is **not** a failing-then-passing regression test here. The source patch and evidence should be recovered from the authorized Musashi engineering records; private registry addresses, site details and production logs must never be copied into this public repository.

## Separate scopes

- **Node-RED wrapper (this repository):** poll timers, close completion and stale reads after disconnection. This PR adds offline regression tests and a scoped correction.
- **Protocol dependency (`@st-one-io/nodes7`):** connection-attempt lifecycle, pending/active transport ownership, COTP handshake, timeout cancellation, socket destruction and listener cleanup. Requires direct dependency-level tests; a wrapper fix does not establish socket cleanup.
- **s7-plus:** separate implementation/protocol; do not conflate its patches with the classic nodes7 backend.

## Minimum acceptance evidence

1. Recover authorized original patch/source revision, inspect license and provenance, and construct a minimal failing reproduction.
2. Inject interrupted and stalled handshakes, TCP resets and repeated reconnect attempts before the connection becomes active.
3. Record application-managed open sockets, connection attempts, timing, teardown, error events and process resource usage. TIME_WAIT alone is not a socket-leak signal.
4. Show failure on a named baseline and success with the minimal correction in the proper source repository or dependency fork.
5. Run repeated fault cycles, verify normal read/write behavior, and retain redacted logs and the actual CI run identifiers.
6. Separately document any simulator or real-Siemens-hardware evidence before compatibility claims.
