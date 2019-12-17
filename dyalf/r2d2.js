"use strict";

const noble = require('noble');
const utils = require('./utils')
const Droid = require('./droid');

const CONNECT_SERVICE = "00020001574f4f2053706865726f2121";
const CONNECT_CHAR = "00020005574f4f2053706865726f2121";
const SPECIAL_SERVICE = "00010001574f4f2053706865726f2121";
const SPECIAL_CHAR = "00010002574f4f2053706865726f2121";
const MSG_CONNECTION = [0x75,0x73,0x65,0x74,0x68,0x65,0x66,0x6F,0x72,0x63,0x65,0x2E,0x2E,0x2E,0x62,0x61,0x6E,0x64];
const MSG_INIT = [0x0A,0x13,0x0D];

//8d09130d0000d6d8

const MSG_BEEP = [0x0A,0x11,0x06];

const MSG_ANIMATION = [0x0A,0x17,0x05];

const MSG_CARRIAGE = [0x0A, 0x17, 0x0D];
const MSG_OFF = [0x0A,0x13,0x01];

class R2D2 extends Droid {

    constructor (address=null) {
        super(address);
    }

    _buildPacket(init, data=[]) {
        var packet = [0x8D];
        var body = []
        body.push(...init);
        body.push(this._seq);
        body.push(...data);
        packet.push(...body);
        packet.push(utils.calculateChk(body));
        packet.push(0xD8);
        this._seq += 1;
        // for (var i = 0 ; i < packet.length ; i++)
        //     console.log(packet[i].toString('hex') )
        return packet;
    }

    connect() {
        super.connect();
        return new Promise((resolve, reject) => {
            noble.on('discover', (peripheral) => {
                if (peripheral.advertisement.localName === 'D2-7BD6') {
                    console.log(peripheral)
                    peripheral.connect( () => {
                        peripheral.discoverServices([CONNECT_SERVICE], (error, services) => {
                            services[0].discoverCharacteristics([CONNECT_CHAR], (error, characteristics) => {
                                this._connectChar = characteristics[0];
                                this._connectChar.write(new Buffer(MSG_CONNECTION), true, (error) => {



                                    peripheral.discoverServices([SPECIAL_SERVICE], (error, services) => {
                                        services[0].discoverCharacteristics([SPECIAL_CHAR], (error, characteristics) => {
                                            this._specialChar = characteristics[0];
                                            this._specialChar.subscribe(error => {
                                                if (error) {
                                                    console.error('Error subscribing to char.');
                                                } else {
                                                    console.log('Subscribed for char. notifications');
                                                }
                                            });
                                            utils.writeAndWait(
                                                'INi',
                                                this._specialChar,
                                                this._buildPacket(MSG_INIT),
                                                true,
                                                5000
                                            ).then(() => {
                                                console.log('INIT');
                                                resolve(true);
                                            })
                                        });
                                    });
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

    mess(data, params=[], wait=false, timeout=0) {
        return utils.writeAndWait(
            'MESS', this._specialChar,
            this._buildPacket(data, params),
            wait,
            timeout
        );
    }

    animate(animationId) {
        return utils.writeAndWait(
            'ANIMATE',
            this._specialChar,
            this._buildPacket(MSG_ANIMATION, [0x00, animationId]),
            true
        );
    }

    beep() {
        return utils.writeAndWait('BEEP', this._specialChar, this._buildPacket(MSG_BEEP));
    }

    openCarriage() {
        return utils.writeAndWait(
            'CARROPEN',
            this._specialChar,
            this._buildPacket(MSG_CARRIAGE, [0x01]),
            false,
            2000
        );
    }

    closeCarriage() {
        return utils.writeAndWait(
            'CARRCLOSE',
            this._specialChar,
            this._buildPacket(MSG_CARRIAGE, [0x02]),
            false,
            2000
        );
    }

    off() {
        return utils.writeAndWait('OFF',this._specialChar, this._buildPacket(MSG_OFF), true);
    }

};


module.exports = R2D2;
