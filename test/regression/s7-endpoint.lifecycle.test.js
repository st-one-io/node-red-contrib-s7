'use strict';
// These unit tests isolate Node-RED and nodes7. They do NOT test a real S7 socket.
const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceFile = process.env.S7_TEST_SOURCE || path.join(__dirname, '../../red/s7.js');
const source = fs.readFileSync(path.resolve(sourceFile), 'utf8');

function pending() {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

function fixture() {
    const types = new Map(), timers = new Set(), errors = [], events = [];
    let group;
    class Transport extends EventEmitter {
        constructor() {
            super();
            this.disconnectCount = 0;
            this.disconnectPromise = Promise.resolve();
        }
        disconnect() {
            this.disconnectCount++;
            return this.disconnectPromise;
        }
    }
    class ItemGroup {
        constructor(endpoint) {
            this.endpoint = endpoint;
            this.nextRead = () => Promise.resolve({ tag: 42 });
            group = this;
        }
        setTranslationCB(fn) { this.translate = fn; }
        addItems(keys) { this.keys = keys; }
        readAllItems() { return this.nextRead(); }
        writeItems() { return Promise.resolve(); }
    }
    const RED = {
        _: key => key,
        auth: { needsPermission: () => () => {} },
        httpAdmin: { get: () => {} },
        nodes: {
            registerType: (name, ctor) => types.set(name, ctor),
            getNode: () => null,
            createNode: node => {
                Object.setPrototypeOf(node, EventEmitter.prototype);
                node.error = err => errors.push(err);
                node.warn = () => {};
                node.status = () => {};
                node.send = () => {};
            }
        }
    };
    const sandbox = {
        module: { exports: {} },
        require: id => {
            if (id === 'events') return require('node:events');
            if (id === '../src/tools.js') return {};
            if (id === '@st-one-io/nodes7') return { S7Endpoint: Transport, S7ItemGroup: ItemGroup };
            throw Error('Unexpected require ' + id);
        },
        setInterval(fn, ms) {
            const id = { fn, ms };
            timers.add(id);
            return id;
        },
        clearInterval(id) { timers.delete(id); }
    };
    vm.runInNewContext(source, sandbox, { filename: 'red/s7.js' });
    sandbox.module.exports(RED);
    const Endpoint = types.get('s7 endpoint');
    assert.ok(Endpoint);
    const node = new Endpoint({
        transport: 'iso-on-tcp', connmode: 'rack-slot', address: '127.0.0.1',
        port: 1102, rack: 0, slot: 1, timeout: 200, cycletime: 50,
        vartable: [{ name: 'tag', addr: 'DB1,REAL0' }]
    });
    node.on('__STATUS__', s => events.push(s.status));
    return { node, transport: node.endpoint, group, timers, errors, events };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const close = node => new Promise(resolve => node.emit('close', resolve));
// Issue #3 positive reliability regressions. Tests MUST PASS on this wrapper
// and FAIL individually on pinned, unmodified master e79c151.
// The protected branch's historic required check name is retained, but it now
// enforces BOTH the red baseline and the green corrected implementation.
// HIL-S7-004, HIL-S7-005: pending physical CPU read/fault tests.
test('late successful read cannot resurrect disconnected status', async () => {
    const { node, transport, group, events } = fixture();
    const p = pending();
    group.nextRead = () => p.promise;
    transport.emit('connect');
    node.doCycle();
    await tick();
    transport.emit('disconnect');
    p.resolve({ tag: 99 });
    await tick();
    assert.equal(node.getStatus(), 'offline');
    assert.equal(events.at(-1), 'offline');
    await close(node);
});

test('late failure from an obsolete read must not mark a reconnected endpoint offline', async () => {
    const { node, transport, group, errors } = fixture();
    const oldRead = pending();
    let readCalls = 0;
    group.nextRead = () => ++readCalls === 1
        ? oldRead.promise
        : Promise.resolve({ tag: 42 });

    transport.emit('connect');
    node.doCycle();
    transport.emit('disconnect');
    transport.emit('connect');
    node.doCycle();
    await tick();
    assert.equal(node.getStatus(), 'online', 'new session has connected and read');

    oldRead.reject(Error('obsolete session read failed'));
    await tick();
    // A prior session failure must not demote the newly healthy endpoint.
    assert.equal(node.getStatus(), 'online');
    assert.equal(errors.length, 0, 'obsolete rejection must not emit a new error');
});

test('a reconnect must not overlap a pending read on the same item group', async () => {
    const { node, transport, group } = fixture();
    const oldRead = pending();
    let readCalls = 0;
    group.nextRead = () => {
        readCalls++;
        return readCalls === 1
            ? oldRead.promise
            : Promise.resolve({ tag: 45 });
    };

    transport.emit('connect');
    node.doCycle();
    assert.equal(readCalls, 1);

    transport.emit('disconnect');
    transport.emit('connect');
    node.doCycle();
    // Original onConnect() clears readInProgress, allowing an overlapping
    // read while the first promise is still pending.
    assert.equal(readCalls, 1, 'do not overlap an unresolved read after reconnect');

    oldRead.resolve({ tag: 44 });
    await tick();
    assert.equal(readCalls, 2, 'a replacement read may run after old read settles');
});

test('late successful read must not publish obsolete data after disconnect', async () => {
    // HIL-S7-004: pending isolated real S7-1200 read/disconnect sequence.
    const { node, transport, group } = fixture();
    const oldRead = pending();
    const all = [], changed = [];
    node.on('__ALL__', values => all.push(values));
    node.on('__CHANGED__', event => changed.push(event));
    group.nextRead = () => oldRead.promise;

    transport.emit('connect');
    node.doCycle();
    transport.emit('disconnect');
    oldRead.resolve({ tag: 999 });
    await tick();

    assert.equal(all.length, 0, 'disconnected read must not publish an all-values event');
    assert.equal(changed.length, 0, 'disconnected read must not emit a change');
});

test('closing an endpoint cancels its polling timer during a pending read', async () => {
    // HIL-S7-007: pending isolated real CPU close/redeploy validation.
    const { node, transport, group, timers } = fixture();
    group.nextRead = () => new Promise(() => {});
    transport.emit('connect');
    node.doCycle();
    assert.equal(timers.size, 1, 'connection starts a polling timer');

    await close(node);
    assert.equal(node.getStatus(), 'offline');
    assert.equal(timers.size, 0, 'closed endpoint must stop scheduling new PLC polls');
});

test('stale success after reconnect cannot publish old data or delay a fresh read', async () => {
    // HIL-S7-004 / HIL-S7-005: hardware verification remains pending.
    const { node, transport, group } = fixture();
    const first = pending();
    const all = [];
    let calls = 0;
    node.on('__ALL__', values => all.push(values.tag));
    group.nextRead = () => ++calls === 1 ? first.promise : Promise.resolve({ tag: 22 });
    transport.emit('connect');
    node.doCycle();
    transport.emit('disconnect');
    transport.emit('connect');
    node.doCycle();
    assert.equal(calls, 1, 'new session must wait for unsettled old read');
    first.resolve({ tag: 11 });
    await tick();
    assert.equal(calls, 2, 'fresh read must start after old operation settles');
    assert.deepEqual(all, [22], 'obsolete data must never be emitted');
});

test('close reports completion even when transport disconnect rejects', async () => {
    // HIL-S7-007: pending isolated physical CPU cleanup validation.
    const { node, transport, errors } = fixture();
    transport.emit('connect');
    transport.disconnectPromise = Promise.reject(new Error('transport shutdown failed'));
    let completed = 0;
    node.emit('close', () => { completed++; });
    await tick();
    assert.equal(completed, 1, 'Node-RED close callback must not be stranded');
    assert.equal(errors.length, 1, 'the disconnect error should remain observable');
    assert.equal(node.getStatus(), 'offline');
});

test('disabled polling remains disabled across a disconnect and reconnect', () => {
    // HIL-S7-005 / HIL-S7-007: physical hardware validation is pending.
    const { node, transport, timers } = fixture();
    transport.emit('connect');
    assert.equal(timers.size, 1);
    node.updateCycleTime(0);
    assert.equal(timers.size, 0, 'disabled timer is removed');
    transport.emit('disconnect');
    transport.emit('connect');
    assert.equal(timers.size, 0, 'reconnect must honor the disabled interval');
});

test('closed endpoint ignores a late connect and a pending read result', async () => {
    // HIL-S7-004 / HIL-S7-007: hardware verification pending.
    const { node, transport, group, timers } = fixture();
    const first = pending();
    const all = [];
    let calls = 0;
    group.nextRead = () => ++calls === 1 ? first.promise : Promise.resolve({ tag: 222 });
    node.on('__ALL__', values => all.push(values.tag));
    transport.emit('connect');
    node.doCycle();
    await close(node);
    transport.emit('connect');
    node.doCycle();
    first.resolve({ tag: 111 });
    await tick();
    assert.equal(node.getStatus(), 'offline');
    assert.equal(timers.size, 0, 'closed endpoint must not resume polling');
    assert.equal(calls, 1, 'closed endpoint must not launch another read');
    assert.deepEqual(all, [], 'old read must never publish after close');
});

test('transport error discards old read but allows a subsequent polling retry', async () => {
    // HIL-S7-004 / HIL-S7-005: hardware fault injection pending.
    // An error event alone does not prove that the connection was closed.
    const { node, transport, group, errors, timers } = fixture();
    const first = pending();
    const all = [];
    let calls = 0;
    node.on('__ALL__', values => all.push(values.tag));
    group.nextRead = () => ++calls === 1 ? first.promise : Promise.resolve({ tag: 42 });
    transport.emit('connect');
    node.doCycle();
    transport.emit('error', new Error('transient S7 transport fault'));
    assert.equal(node.getStatus(), 'offline');
    assert.equal(timers.size, 1, 'error alone retains the existing retry schedule');
    first.resolve({ tag: 333 });
    await tick();
    assert.equal(calls, 2, 'a clean follow-up read must occur after old read settles');
    assert.deepEqual(all, [42], 'stale error-era read must not publish its old value');
    assert.equal(node.getStatus(), 'online', 'successful fresh read restores status');
    assert.equal(errors.length, 1, 'actual transport error remains observable');
});
