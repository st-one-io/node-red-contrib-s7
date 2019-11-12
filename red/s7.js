//@ts-check
/*
  Copyright: (c) 2016-2019, Smart-Tech Controle e Automação
  GNU General Public License v3.0+ (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
*/


function nrInputShim(node, fn) {
    function doErr(err) { err && node.error(err) }
    node.on('input', function (msg, send, done) {
        send = send || node.send;
        done = done || doErr;
        fn(msg, send, done);
    });
}

/**
 * Compares values for equality, includes special handling for arrays. Fixes #33
 * @param {number|string|Array} a
 * @param {number|string|Array} b 
 */
function equals(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length != b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    return false;
}

var MIN_CYCLE_TIME = 50;

var tools = require('../src/tools.js');

module.exports = function (RED) {
    "use strict";

    var util = require('util');
    var nodes7 = require('nodes7');
    var EventEmitter = require('events').EventEmitter;
    var mpiS7;

    // ---------- Discovery Endpoints ----------

    RED.httpAdmin.get('/__node-red-contrib-s7/discover/available/iso-on-tcp', RED.auth.needsPermission('s7.discover'), function(req, res) {
        tools.isPnToolsAvailable().then(function(available){
            res.json(available).end();
        }).catch(() => {
            res.status(500).end();
        });
    });

    RED.httpAdmin.get('/__node-red-contrib-s7/discover/available/mpi-s7', RED.auth.needsPermission('s7.discover'), function(req, res) {
        tools.isMpiS7Available().then(function(available){
            res.json(available).end();
        }).catch(() => {
            res.status(500).end();
        });
    });

    RED.httpAdmin.get('/__node-red-contrib-s7/discover/iso-on-tcp', RED.auth.needsPermission('s7.discover'), function(req, res) {
        tools.listDevicesPN().then(function(devices){
            res.json(devices).end();
        }).catch(() => {
            res.status(500).end();
        });
    });

    RED.httpAdmin.get('/__node-red-contrib-s7/flashled/iso-on-tcp/:mac', RED.auth.needsPermission('s7.discover'), function(req, res) {
        let mac_addr = (req.params.mac || '').replace(/-/g, ':');
        if (!/^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/.test(mac_addr)){
            res.status(400).end();
            return;
        }

        tools.flashLedPN(mac_addr).then(function(){
            res.status(204).end();
        }).catch(() => {
            res.status(500).end();
        });
    });

    // ---------- S7 Endpoint ----------

    function createTranslationTable(vars) {
        var res = {};

        vars.forEach(function (elm) {
            if (!elm.name || !elm.addr) {
                //skip incomplete entries
                return;
            }
            res[elm.name] = elm.addr;
        });

        return res;
    }

    function generateStatus(status, val) {
        var obj;

        if (typeof val != 'string' && typeof val != 'number' && typeof val != 'boolean') {
            val = RED._("s7.endpoint.status.online");
        }

        switch (status) {
            case 'online':
                obj = {
                    fill: 'green',
                    shape: 'dot',
                    text: val.toString()
                };
                break;
            case 'badvalues':
                obj = {
                    fill: 'yellow',
                    shape: 'dot',
                    text: RED._("s7.endpoint.status.badvalues")
                };
                break;
            case 'offline':
                obj = {
                    fill: 'red',
                    shape: 'dot',
                    text: RED._("s7.endpoint.status.offline")
                };
                break;
            case 'connecting':
                obj = {
                    fill: 'yellow',
                    shape: 'dot',
                    text: RED._("s7.endpoint.status.connecting")
                };
                break;
            default:
                obj = {
                    fill: 'grey',
                    shape: 'dot',
                    text: RED._("s7.endpoint.status.unknown")
                };
        }
        return obj;
    }

    function validateTSAP(num) {
        num = num.toString();
        if (num.length != 2) return false;
        if (!(/^[0-9a-fA-F]+$/.test(num))) return false;
        var i = parseInt(num, 16);
        if (isNaN(i) || i < 0 || i > 0xff) return false;
        return true;
    }

    function S7Endpoint(config) {
        EventEmitter.call(this);
        var node = this;
        var oldValues = {};
        var connOpts;
        var status;
        var readInProgress = false;
        var readDeferred = 0;
        var vars = config.vartable;
        var isVerbose = (config.verbose == 'on' || config.verbose == 'off') ? (config.verbose == 'on') : RED.settings.get('verbose');
        var connectTimeoutTimer;
        var connected = false;
        var currentCycleTime = config.cycletime;
        var transport = config.transport || 'iso-on-tcp';
        var NodeS7;
        node.writeInProgress = false;
        node.writeQueue = [];

        if (typeof vars == 'string') {
            vars = JSON.parse(vars);
        }

        if (transport === 'mpi-usb' && !mpiS7) {
            //lazy load mpi-s7 library, as we may not need it
            try {
                mpiS7 = require('mpi-s7');
            } catch (e) {
                node.error(RED._('s7.error.nompiusblibrary'));
                return;
            }
        }

        RED.nodes.createNode(this, config);

        //avoids warnings when we have a lot of S7In nodes
        this.setMaxListeners(0);

        if (transport === 'mpi-usb') {

            NodeS7 = mpiS7.NodeS7;

            connOpts = {
                mpiAddress: parseInt(config.busaddr),
                selfMpiAddress: parseInt(config.adapteraddr),
            }

        } else if (transport === 'iso-on-tcp') {

            NodeS7 = nodes7;

            connOpts = {
                host: config.address,
                port: config.port
            };

            switch (config.connmode) {
                case "rack-slot":
                    connOpts.rack = config.rack;
                    connOpts.slot = config.slot;
                    break;
                case "tsap":
                    if (!validateTSAP(config.localtsaphi) ||
                        !validateTSAP(config.localtsaplo) ||
                        !validateTSAP(config.remotetsaphi) ||
                        !validateTSAP(config.remotetsaplo)) {
                        node.error(RED._("s7.error.invalidtsap", config));
                        return;
                    }

                    connOpts.localTSAP = parseInt(config.localtsaphi, 16) << 8;
                    connOpts.localTSAP += parseInt(config.localtsaplo, 16);
                    connOpts.remoteTSAP = parseInt(config.remotetsaphi, 16) << 8;
                    connOpts.remoteTSAP += parseInt(config.remotetsaplo, 16);
                    break;
                default:
                    node.error(RED._("s7.error.invalidconntype", config));
                    return;
            }
        } else {
            node.error(RED._("s7.error.invalidconntype", config));
            return;
        }

        node._vars = createTranslationTable(vars);

        node.getStatus = function getStatus() {
            return status;
        };

        node.writeVar = function writeVar(obj) {
            node.writeQueue.push(obj);

            if (!node.writeInProgress) {
                writeNext();
            }

        };

        /**
         * updates the current cycle time on the fly. A value of 0
         * disables the cyclic reading of variables, and for positive values
         * a minimum of 50 ms is enforced
         * 
         * @param {number} interval the cycle time interval, in ms
         * @returns {string|undefined} an string with the error if any, or undefined
         */
        node.updateCycleTime = function updateCycleTime(interval) {
            let time = parseInt(interval);

            if (isNaN(time) || time < 0) {
                return RED._("s7.error.invalidtimeinterval", { interval: interval });
            }

            clearInterval(node._td);

            // don't set a new timer if value is zero
            if (!time) return;

            if (time < MIN_CYCLE_TIME) {
                node.warn(RED._("s7.info.cycletimetooshort", { min: MIN_CYCLE_TIME }), {});
                time = MIN_CYCLE_TIME;
            }

            currentCycleTime = time;
            node._td = setInterval(doCycle, time);
        }

        function onWritten(err) {
            node.writeInProgress = false;
            var elm = node.writeQueue.shift();

            writeNext();

            if (err) {
                manageStatus('badvalues');
                elm.done(RED._("s7.error.badvalues"), {});
            } else {
                manageStatus('online');
                elm.done();
            }

            manageStatus('online');
        }

        function writeNext() {
            if (!connected) return;

            var nextElm = node.writeQueue[0];
            if (nextElm) {
                node._conn.writeItems(nextElm.name, nextElm.val, onWritten);
                node.writeInProgress = true;
            }
        }

        function manageStatus(newStatus) {
            if (status == newStatus) return;

            status = newStatus;
            node.emit('__STATUS__', {
                status: status
            });
        }

        function cycleCallback(err, values) {
            readInProgress = false;

            if (readDeferred && connected) {
                doCycle();
                readDeferred = 0;
            }

            if (err) {
                manageStatus('badvalues');
                node.error(RED._("s7.error.badvalues"), {});
                return;
            }

            manageStatus('online');

            var changed = false;
            node.emit('__ALL__', values);
            Object.keys(values).forEach(function (key) {
                if (!equals(oldValues[key], values[key])) {
                    changed = true;
                    node.emit(key, values[key]);
                    node.emit('__CHANGED__', {
                        key: key,
                        value: values[key]
                    });
                    oldValues[key] = values[key];
                }
            });
            if (changed) node.emit('__ALL_CHANGED__', values);
        }

        function doCycle() {
            if (!readInProgress && connected) {
                node._conn.readAllItems(cycleCallback);
                readInProgress = true;
            } else {
                readDeferred++;

                if (readDeferred > 10) {
                    node.warn(RED._("s7.error.noresponse"), {});
                    connect(); //this also drops any existing connection
                }
            }
        }
        node.doCycle = doCycle;

        function onConnect(err) {
            var varKeys = Object.keys(node._vars);

            clearTimeout(connectTimeoutTimer);

            if (err) {
                manageStatus('offline');
                node.error(RED._("s7.error.onconnect") + err.toString(), {});

                connected = false;

                //try to reconnect if failed to connect
                connectTimeoutTimer = setTimeout(connect, 5000);

                return;
            }

            readInProgress = false;
            readDeferred = 0;
            connected = true;

            manageStatus('online');

            if (!varKeys || !varKeys.length) {
                node.warn(RED._("s7.info.novars"), {});
                return;
            }

            node._conn.setTranslationCB(function (tag) {
                return node._vars[tag];
            });
            node._conn.addItems(varKeys);
            node.updateCycleTime(currentCycleTime);

            writeNext();
        }

        function closeConnection(done) {
            //ensure we won't try to connect again if anybody wants to close it
            clearTimeout(connectTimeoutTimer);

            if (isVerbose) {
                node.log(RED._("s7.info.disconnect"));
            }
            manageStatus('offline');
            clearInterval(node._td);

            function doCb() {
                node._conn = null;
                if (typeof done == 'function') done();
            }
            connected = false;

            if (node._conn) {
                node._conn.dropConnection(doCb);
            } else {
                process.nextTick(doCb);
            }
        }

        node.on('close', closeConnection);


        function connect() {
            function doConnect() {
                manageStatus('connecting');

                if (isVerbose) {
                    node.log(RED._("s7.info.connect"));
                }

                connected = false;
                node._conn = new NodeS7({
                    silent: !isVerbose,
                    debug: isVerbose
                });
                node._conn.globalTimeout = parseInt(config.timeout) || 1500;
                node._conn.initiateConnection(connOpts, onConnect);
            }

            if (node._conn) {
                closeConnection(doConnect);
            } else {
                process.nextTick(doConnect);
            }
        }

        connect();

    }
    RED.nodes.registerType("s7 endpoint", S7Endpoint);

    // ---------- S7 In ----------

    function S7In(config) {
        var node = this;
        var statusVal;
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("s7.error.missingconfig"));
        }

        function sendMsg(data, key, status) {
            if (key === undefined) key = '';
            var msg = {
                payload: data,
                topic: key
            };
            statusVal = status !== undefined ? status : data;
            node.send(msg);
            node.status(generateStatus(node.endpoint.getStatus(), statusVal));
        }

        function onChanged(variable) {
            sendMsg(variable.value, variable.key, null);
        }

        function onDataSplit(data) {
            Object.keys(data).forEach(function (key) {
                sendMsg(data[key], key, null);
            });
        }

        function onData(data) {
            sendMsg(data, config.mode == 'single' ? config.variable : '');
        }

        function onDataSelect(data) {
            onData(data[config.variable]);
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        node.status(generateStatus(node.endpoint.getStatus(), statusVal));
        node.endpoint.on('__STATUS__', onEndpointStatus);

        if (config.diff) {
            switch (config.mode) {
                case 'all-split':
                    node.endpoint.on('__CHANGED__', onChanged);
                    break;
                case 'single':
                    node.endpoint.on(config.variable, onData);
                    break;
                case 'all':
                default:
                    node.endpoint.on('__ALL_CHANGED__', onData);
            }
        } else {
            switch (config.mode) {
                case 'all-split':
                    node.endpoint.on('__ALL__', onDataSplit);
                    break;
                case 'single':
                    node.endpoint.on('__ALL__', onDataSelect);
                    break;
                case 'all':
                default:
                    node.endpoint.on('__ALL__', onData);
            }
        }

        node.on('close', function (done) {
            node.endpoint.removeListener('__ALL__', onDataSelect);
            node.endpoint.removeListener('__ALL__', onDataSplit);
            node.endpoint.removeListener('__ALL__', onData);
            node.endpoint.removeListener('__ALL_CHANGED__', onData);
            node.endpoint.removeListener('__CHANGED__', onChanged);
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);
            node.endpoint.removeListener(config.variable, onData);
            done();
        });
    }
    RED.nodes.registerType("s7 in", S7In);

    // ---------- S7 Out ----------

    function S7Out(config) {
        var node = this;
        var statusVal;
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("s7.error.missingconfig"));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        function onNewMsg(msg, send, done) {
            var writeObj = {
                name: config.variable || msg.variable,
                val: msg.payload,
                done: done
            };

            // Test for the case we're writing multiple vars
            if (Array.isArray(writeObj.name)) {

                if (!Array.isArray(writeObj.val) || writeObj.val.length !== writeObj.name.length) {
                    node.error(RED._("s7.error.valmismatch"));
                    node.status(generateStatus('badvalues', statusVal));
                    return;
                }

                for (const elm of writeObj.name) {
                    if (!node.endpoint._vars[elm]) {
                        node.error(RED._("s7.error.varunknown", { var: elm }));
                        node.status(generateStatus('badvalues', statusVal));
                        return;
                    }
                }

            } else if (!node.endpoint._vars[writeObj.name]) {
                node.error(RED._("s7.error.varunknown", { var: writeObj.name }));
                node.status(generateStatus('badvalues', statusVal));
                return;
            }

            statusVal = writeObj.val;
            node.endpoint.writeVar(writeObj);
            node.status(generateStatus(node.endpoint.getStatus(), statusVal));
        }

        nrInputShim(node, onNewMsg);
        
        node.status(generateStatus(node.endpoint.getStatus(), statusVal));
        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function (done) {
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);
            done();
        });

    }
    RED.nodes.registerType("s7 out", S7Out);


    // ---------- S7 Control ----------

    function S7Control(config) {
        var node = this;
        var statusVal;
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("s7.error.missingconfig"));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        function onMessage(msg, send, done) {
            var res;
            switch (config.function) {
                case 'cycletime':
                    res = node.endpoint.updateCycleTime(msg.payload);
                    if (res) {
                        done(res, msg);
                    } else {
                        send(msg);
                    }
                    break;
                case 'trigger':
                    node.endpoint.doCycle();
                    send(msg);
                    break;

                default:
                    node.error(RED._("s7.error.invalidcontrolfunction", { function: config.function }), msg);
            }
        }

        node.status(generateStatus(node.endpoint.getStatus(), statusVal));

        nrInputShim(node, onMessage);
        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function (done) {
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);
            done();
        });

    }
    RED.nodes.registerType("s7 control", S7Control);
};
