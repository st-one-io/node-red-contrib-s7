//@ts-check
/*
  Copyright: (c) 2016-2020, ST-One Ltda., Guilherme Francescon Cittolin <guilherme@st-one.io>
  GNU General Public License v3.0+ (see LICENSE or https://www.gnu.org/licenses/gpl-3.0.txt)
*/

const path = require('path');
const util = require('util');
const os = require('os');
const exec = util.promisify(require('child_process').exec);

const pnToolsPath = 'pn-tools';
const pnDevRoleMask = 0x02;

class Tools {

    constructor() {
        this.pnToolsAvailable = null;
        this.ifaceCache = new Map();
    }

    async isPnToolsAvailable() {
        if (this.pnToolsAvailable === null) {
            try {
                await exec(`${pnToolsPath} version`);
                this.pnToolsAvailable = true;
            } catch (e) {
                this.pnToolsAvailable = false;
            }
        }

        return this.pnToolsAvailable;
    }

    getIfaces() {
        let ifaces = os.networkInterfaces();
        return Object.keys(ifaces).filter(v => ifaces[v][0] && !ifaces[v][0].internal)
    }

    async listDevicesPN() {
        if (!await this.isPnToolsAvailable()) return [];

        let proms = [];
        for (const iface of this.getIfaces()) {
            proms.push(exec(`${pnToolsPath} discovery -o -i "${iface}"`).then(res => {return {iface, res};}));
        }

        let devs = [];
        let results = await Promise.all(proms);

        for (const elm of results) {
            let iface = elm.iface;
            let out = elm.res.stdout.trim().split('\n');
            if (out.length < 2) continue;

            let keys = out.shift().split('\t');
            for (const row of out) {
                let dev = {};
                let elms = row.split('\t');
                for (const i in elms) {
                    dev[keys[i]] = elms[i];
                }

                this.ifaceCache.set(dev['MAC Address'], iface);
                devs.push(dev);
            }
        }

        // filters out devices that don't have the "IO-Controller" (0x02) bit set
        return devs.filter(val => (parseInt(val['Device Role']) & pnDevRoleMask));
    }

    async flashLedPN(mac_addr, iface) {
        if (!await this.isPnToolsAvailable()) return;

        iface = iface || this.ifaceCache.get(mac_addr);
        if (!iface) {
            throw new Error(`Could not determine interface for [${mac_addr}]`);
        }

        await exec(`${pnToolsPath} flashled -i "${iface}" -t "${mac_addr}"`);
    }
}

module.exports = new Tools();