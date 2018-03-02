/*
   Copyright 2016-2017 Smart-Tech Controle e Automação

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
        var isVerbose = (config.verbose == 'on' || config.verbose == 'off') ? (config.verbose=='on') : RED.settings.get('verbose');
        var connectTimeoutTimer;
        var connected = false;
        node.writeInProgress = false;
        node.writeQueue = [];

        if (typeof vars == 'string') {
            vars = JSON.parse(vars);
        }

        RED.nodes.createNode(this, config);

        //avoids warnings when we have a lot of S7In nodes
        this.setMaxListeners(0);

        connOpts = {
            host: config.address,
            port: config.port
        }

        if(config.connmode === undefined) {
            //default for old configurations
            config.connmode = 'rack-slot';
        }


        switch(config.connmode) {
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

        node._vars = createTranslationTable(vars);

        node.getStatus = function getStatus() {
            return status;
        }

        node.writeVar = function writeVar(obj) {
            node.writeQueue.push(obj);

            if(!node.writeInProgress) {
                writeNext();
            }

        };

        function onWritten(err) {
            node.writeInProgress = false;

            writeNext();

            if (err) {
                manageStatus('badvalues');
                node.error(RED._("s7.error.badvalues"), {});
                return;
            }

            manageStatus('online');
        }

        function writeNext() {
            if(!connected) return;

            var nextElm = node.writeQueue.shift();
            if(nextElm) {
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
            Object.keys(values).forEach(function(key) {
                if (oldValues[key] !== values[key]) {
                    changed = true;
                    node.emit(key, values[key]);
                    node.emit('__CHANGED__', {key: key, value: values[key]});
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

                if(readDeferred > 10) {
                    node.warn(RED._("s7.error.noresponse"), {});
                    connect(); //this also drops any existing connection
                }
            }
        }

        function onConnect(err) {
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

            node._conn.setTranslationCB(function(tag) {
                return node._vars[tag];
            });
            node._conn.addItems(Object.keys(node._vars));
            node._td = setInterval(doCycle, config.cycletime);

            writeNext();
        }
        
        function closeConnection(done) {
            if (isVerbose) {
                node.log(RED._("s7.info.disconnect"));
            }
            manageStatus('offline');
            clearInterval(node._td);

            function doCb(){
                node._conn = null;
                if (typeof done == 'function') done();
            }
            connected = false;

            if(node._conn) {
                node._conn.dropConnection(doCb);
            } else {
                process.nextTick(doCb);
            }
        }

        node.on('close', closeConnection);


        function connect(){
            function doConnect() {
                manageStatus('connecting');

                if (isVerbose) {
                    node.log(RED._("s7.info.connect"));
                }

                connected = false;
                node._conn = new nodes7({
                    silent: !isVerbose,
                    debug: isVerbose
                });
                node._conn.globalTimeout = parseInt(config.timeout) || 1500;
                node._conn.initiateConnection(connOpts, onConnect);
            }

            if(node._conn) {
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
            return node.error(RED._("s7.in.error.missingconfig"));
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
            Object.keys(data).forEach(function(key) {
                sendMsg(data[key], key, null)
            });
        }

        function onData(data) {
            sendMsg(data, config.mode == 'single' ? config.variable : '')
        }

        function onDataSelect(data) {
            onData(data[config.variable]);
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        node.status(generateStatus("connecting", ""));

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

        node.on('close', function(done) {
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
            return node.error(RED._("s7.in.error.missingconfig"));
        }

        function onEndpointStatus(s) {
            node.status(generateStatus(s.status, statusVal));
        }

        function onNewMsg(msg) {
            var writeObj = {
                name: config.variable || msg.variable,
                val: msg.payload
            }

            if(!writeObj.name) return;

            statusVal = writeObj.val;
            node.endpoint.writeVar(writeObj);
            node.status(generateStatus(node.endpoint.getStatus(), statusVal));
        }

        node.status(generateStatus("connecting", ""));

        node.on('input', onNewMsg);
        node.endpoint.on('__STATUS__', onEndpointStatus);

        node.on('close', function(done) {
            node.endpoint.removeListener('__STATUS__', onEndpointStatus);
            done();
        });

    }
    RED.nodes.registerType("s7 out", S7Out);
};
