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
// Known defect: the unmodified wrapper marks itself online when a read from
// a disconnected session resolves late. This test is EXPECTED TO FAIL until a
// separate issue #3 change fixes and validates the behavior.
// Keep this in a separate file from required passing baseline tests.
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
