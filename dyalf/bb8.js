"use strict";

const noble = require('noble');
const utils = require('./utils')
const Droid = require('./droid');

const CONNECT_SERVICE = "22bb746f2bb075542d6f726568705327";

const ANTIDOS_CHAR = "22bb746f2bbd75542d6f726568705327";
const WKUPCPU_CHAR = "22bb746f2bbf75542d6f726568705327";
const TXPW_CHAR = "22bb746f2bb275542d6f726568705327";

const CMD_SERVICE = "22bb746f2ba075542d6f726568705327";
const ROLL_CHAR = "22bb746f2ba175542d6f726568705327";

const MSG_INIT_ANTIDOS = [0x30,0x31,0x31,0x69,0x33];
const MSG_INIT_TXPW = [0x00,0x07];
const MSG_INIT_WKUPCPU = [0x01];


class BB8 extends Droid {

    constructor (address=null) {
        super(address);
    }

    connect() {
        super.connect();
        return new Promise((resolve, reject) => {
            noble.on('discover', (peripheral) => {

                if (peripheral.address === 'ea:51:6c:aa:cc:91') {
                    console.log(peripheral)
                    console.log("INIT")
                    peripheral.connect( () => {
                        peripheral.discoverServices([CONNECT_SERVICE, CMD_SERVICE], (error, services) => {
                            services[1].discoverCharacteristics([ANTIDOS_CHAR, WKUPCPU_CHAR, TXPW_CHAR], (error, characteristics) => {
                                this._antidosChar = characteristics[1];
                                this._wkupChar = characteristics[2];
                                this._txpwChar = characteristics[0];
                                console.log(characteristics.length)

                                this._antidosChar.subscribe(error => {
                                    if (error) {
                                        console.error('Error subscribing to char.');
                                    } else {
                                        console.log('Subscribed for char. notifications');
                                    }
                                });

                                this._wkupChar.subscribe(error => {
                                    if (error) {
                                        console.error('Error subscribing to char.');
                                    } else {
                                        console.log('Subscribed for char. notifications');
                                    }
                                });

                                this._txpwChar.subscribe(error => {
                                    if (error) {
                                        console.error('Error subscribing to char.');
                                    } else {
                                        console.log('Subscribed for char. notifications');
                                    }
                                });

                                utils.writeAndWait(
                                    this._antidosChar,
                                    new Buffer(MSG_INIT_ANTIDOS),
                                    '13'
                                ).then(utils.writeAndWait(
                                    this._txpwChar,
                                    new Buffer(MSG_INIT_TXPW),
                                    '13'
                                )).then(utils.writeAndWait(
                                    this._wkupChar,
                                    new Buffer(MSG_INIT_WKUPCPU),
                                    '13'
                                ));

                                services[0].discoverCharacteristics([ROLL_CHAR], (error, characteristics) => {

                                    this._txChar = characteristics[0];

                                    this._txChar.subscribe(error => {
                                        if (error) {
                                            console.error('Error subscribing to char.');
                                        } else {
                                            console.log('Subscribed for char. notifications');
                                        }
                                    });


                                    this._txChar.subscribe(error => {
                                        if (error) {
                                            console.error('Error subscribing to char.');
                                        } else {
                                            console.log('Subscribed for char. notifications');
                                        }
                                    });

                                    utils.writeAndWait(
                                        this._txChar,
                                        new Buffer([0xFF, 0xFF, 0x00, 0x11, 0x01, 0x01, 0xEC]),
                                        '13'
                                    ).then(resolve(true));

                                });

                            });
                        });
                    });
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


module.exports = BB8;
