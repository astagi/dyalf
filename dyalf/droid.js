"use strict";
const noble = require('noble');


class Droid {

  constructor(uuid = null) {
    this._uuid = uuid;
    this._seq = 0x00;
    this._foundPeripheral = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _findPeripheral() {
    console.log("Searching for " + this.constructor.name + " droid...");
    if (this._uuid) {
      console.log("Looking for a specific UUID " + this._uuid)
    }

    return new Promise((resolve, reject) => {
      noble.on('discover', (peripheral) => {
        if (!this._foundPeripheral) {
          if (peripheral.uuid === this._uuid) {
            this._foundPeripheral = true;
            noble.stopScanning();
            resolve(peripheral);
          }
        }
      });

      noble.startScanning();
    });

  }

};


module.exports = Droid;
