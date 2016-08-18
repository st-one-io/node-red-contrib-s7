/*
   Copyright 2016 Smart-Tech Controle e Automação

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

module.exports = function(RED) {
    "use strict";

    var util = require('util');
    var nodes7 = require('nodes7');
    var EventEmitter = require('events').EventEmitter;

    // ---------- S7 Endpoint ----------

    function createTranslationTable(vars) {
        var res = {};

        vars.forEach(function(elm) {
            res[elm.name] = elm.addr;
        });

        return res;
    }

    function generateStatus(status, val) {
        var obj;

        if (typeof val != 'string' && typeof val != 'number') {
            val = RED._("s7.endpoint.status.online");
        }

        switch (status) {
            case 'online':
                obj = {
                    fill: 'green',
                    shape: 'dot',
                    text: val
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
            default:
                obj = {
                    fill: 'grey',
                    shape: 'dot',
                    text: RED._("s7.endpoint.status.unknown")
                };
        }
        return obj;
    }

    function S7Endpoint(config) {
        EventEmitter.call(this);
        var node = this;
        var oldValues = {};
        var status;
        var vars = config.vartable;

        if (typeof vars == 'string') {
            vars = JSON.parse(vars);
        }

        RED.nodes.createNode(this, config);

        node._vars = createTranslationTable(vars);
        node._conn = new nodes7({
            silent: true
        });

        node.getStatus = function getStatus() {
            return status;
        }

        function manageStatus(newStatus) {
            if (status == newStatus) return;

            status = newStatus;
            node.emit('__STATUS__', {
                status: status
            });
        }

        function cycleCallback(err, values) {
            if (err) {
                manageStatus('badvalues');
                node.error(RED._("s7.error.badvalues"));
                return;
            }

            manageStatus('online');

            var changed = false;
            node.emit('__ALL__', values);
            Object.keys(values).forEach(function(key) {
                if (oldValues[key] !== values[key]) {
                    changed = true;
                    node.emit(key, values[key]);
                    oldValues[key] = values[key];
                }
            });
            if (changed) node.emit('__ALL_CHANGED__', values);
        }

        function doCycle() {
            node._conn.readAllItems(cycleCallback);
        }

        function onConnect(err) {
            if (err) {
                manageStatus('offline');
                node.error(RED._("s7.error.onconnect") + err.toString());
                return;
            }

            manageStatus('online');

            node._conn.setTranslationCB(function(tag) {
                return node._vars[tag];
            });
            node._conn.addItems(Object.keys(node._vars));
            node._td = setInterval(doCycle, config.cycletime);
        }

        node.on('close', function(done) {
            clearInterval(node._td);
            node._conn.dropConnection(function() {
                done();
            });
        });

        manageStatus('offline');

        node._conn.initiateConnection({
            host: config.address,
            port: config.port,
            rack: config.rack,
            slot: config.slot
        }, onConnect);
    }

    S7Endpoint.prototype.writeVar = function(variable, val) {
        //TODO!!!!
    };
    RED.nodes.registerType("s7 endpoint", S7Endpoint);

    // ---------- S7 In ----------

    function S7In(config) {
        var node = this;
        var currentVal;
        RED.nodes.createNode(this, config);

        node.endpoint = RED.nodes.getNode(config.endpoint);
        if (!node.endpoint) {
            return node.error(RED._("s7.in.error.missingconfig"));
        }

        function onData(data) {
            var msg = {};
            currentVal = data;
            msg.payload = data;
            msg.topic = config.mode == 'single' ? config.variable : '';
            node.send(msg);
            node.status(generateStatus(node.endpoint.getStatus(), currentVal));
        }

        function onDataSelect(data) {
            onData(data[config.variable]);
        }

        node.endpoint.on('__STATUS__', function(s) {
            node.status(generateStatus(s.status, currentVal));
        });

        if (config.diff) {
            if (config.mode == 'all') {
                node.endpoint.on('__ALL_CHANGED__', onData);
            } else {
                node.endpoint.on(config.variable, onData);
            }
        } else {
            if (config.mode == 'all') {
                node.endpoint.on('__ALL__', onData);
            } else {
                node.endpoint.on('__ALL__', onDataSelect);
            }
        }

        node.on('close', function(done) {
            node.endpoint.removeListener('__ALL__', onDataSelect);
            node.endpoint.removeListener('__ALL__', onData);
            node.endpoint.removeListener('__ALL_CHANGED__', onData);
            node.endpoint.removeListener(config.variable, onData);
            done();
        });
    }
    RED.nodes.registerType("s7 in", S7In);

    /*
    RED.httpAdmin.get('/pendaq/scope', RED.auth.needsPermission('pendaq.scope'), function(req, res) {
        res.json({
            info: "TBD!"
        });
    });
    //*/

};
