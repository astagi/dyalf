"use strict";
const noble = require('noble');


class Droid {

    constructor (address=null) {
        this._address = address;
        this._seq = 0x00;
        this._foundPeripheral = false;
    }

    _findPeripheral() {
        console.log("Searching for " + this.constructor.name + " droid...");
        if (this._address) {
            console.log("Looking for a specific address " + this._address)
        }

        return new Promise((resolve, reject) => {
            noble.on('discover', (peripheral) => {
                if (peripheral.address === this._address && !this._foundPeripheral) {
                    this._foundPeripheral = true;
                    resolve(peripheral);
                }
            });

            noble.on('stateChange', (state) => {
                if (state === 'poweredOn') {
                    noble.startScanning();
                } else {
                    noble.stopScanning();
                }
            });
        });

    }

};


module.exports = Droid;
