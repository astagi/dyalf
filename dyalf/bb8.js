"use strict";


const Droid = require('./droid');

const CONNECT_SERVICE = "22bb746f2bb075542d6f726568705327";
const CMD_SERVICE = "22bb746f2ba075542d6f726568705327";

const ANTIDOS_CHAR = "22bb746f2bbd75542d6f726568705327";
const WKUPCPU_CHAR = "22bb746f2bbf75542d6f726568705327";
const TXPW_CHAR = "22bb746f2bb275542d6f726568705327";

const ROLL_CHAR = "22bb746f2ba175542d6f726568705327";

const MSG_INIT_ANTIDOS = [0x30, 0x31, 0x31, 0x69, 0x33]; //011i3
const MSG_INIT_TXPW = [0x00, 0x07];
const MSG_INIT_WKUPCPU = [0x01];


class BB8 extends Droid {

  constructor(address = null) {
    super(address);
  }

  _writePacket(characteristic, buff, timeout = 0) {
    return new Promise((resolve, reject) => {
      characteristic.write(Buffer.from(buff), false, (error) => {
        if (!error) {
          resolve(true);
        } else {
          reject(error);
        }
      });
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      this._findPeripheral().then((peripheral) => {
        this._peripheral = peripheral;
        peripheral.connect((error) => {
          peripheral.discoverServices([CONNECT_SERVICE], (error, services) => {
            services[0].discoverCharacteristics([ANTIDOS_CHAR], (error, characteristics) => {
              this._antidosChar = characteristics[0];
              services[0].discoverCharacteristics([WKUPCPU_CHAR], (error, characteristics) => {
                this._wkupChar = characteristics[0];
                services[0].discoverCharacteristics([TXPW_CHAR], (error, characteristics) => {
                  this._txpwChar = characteristics[0];
                  this._writePacket(
                    this._antidosChar,
                    MSG_INIT_ANTIDOS,
                  ).then(this._writePacket(
                    this._txpwChar,
                    MSG_INIT_TXPW,
                  )).then(this._writePacket(
                    this._wkupChar,
                    MSG_INIT_WKUPCPU,
                  )).then(resolve(true));
                });
              });
            });
          });
        });
      });
    });
  }

  off() {
    return new Promise((resolve, reject) => {
      this._peripheral.disconnect();
      resolve(true);
    });
  }
};


module.exports = BB8;
