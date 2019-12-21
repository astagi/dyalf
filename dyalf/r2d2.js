"use strict";

const utils = require('./utils')
const Droid = require('./droid');

const CONNECT_SERVICE = "00020001574f4f2053706865726f2121";
const CONNECT_CHAR = "00020005574f4f2053706865726f2121";
const SPECIAL_SERVICE = "00010001574f4f2053706865726f2121";
const SPECIAL_CHAR = "00010002574f4f2053706865726f2121";

const MSG_CONNECTION = [0x75,0x73,0x65,0x74,0x68,0x65,0x66,0x6F,0x72,0x63,0x65,0x2E,0x2E,0x2E,0x62,0x61,0x6E,0x64];
const MSG_INIT = [0x0A,0x13,0x0D];
const MSG_ROTATE = [0x0A,0x17,0x0F];
const MSG_ANIMATION = [0x0A,0x17,0x05];
const MSG_CARRIAGE = [0x0A, 0x17, 0x0D];
const MSG_OFF = [0x0A,0x13,0x01];

const ESC = 0xAB;
const SOP = 0x8D;
const EOP = 0xD8;
const ESC_ESC = 0x23;
const ESC_SOP = 0x05;
const ESC_EOP = 0x50;


class R2D2 extends Droid {

    constructor (address=null) {
        super(address);
    }

    _encodePacketBody(payload) {
        let packetEncoded = [];
        for (let i = 0 ; i < payload.length ; i++) {
            if (payload[i] == ESC) {
                packetEncoded.push(...[ESC, ESC_ESC]);
            }
            else if (payload[i] == SOP) {
                packetEncoded.push(...[ESC, ESC_SOP]);
            }
            else if (payload[i] == EOP) {
                packetEncoded.push(...[ESC, ESC_EOP]);
            }
            else {
                packetEncoded.push(payload[i])
            }
        }
        return packetEncoded;
    }

    _buildPacket(init, payload=[]) {
        let packet = [SOP];
        let body = [];

        body.push(...init);
        body.push(this._seq);
        body.push(...payload);

        body.push(utils.calculateChk(body));

        packet.push(...this._encodePacketBody(body));

        packet.push(EOP);
        this._seq = (this._seq + 1) % 140;

        return packet;
    }

    _writePacket(characteristic, buff, waitForNotification=false, timeout=0) {
        return new Promise(function(resolve, reject) {
            let dataRead = [];

            let checkIsAValidRequest = (dataRead) => {
                if (dataRead[5] != 0x00) {
                    reject(dataRead[5]);
                }
            }

            let finish = () => {
                setTimeout(() => {
                    resolve(true);
                }, timeout);
            }

            let listenerF = (data, isNotification) => {
                dataRead.push(...data)
                if (data[data.length - 1] === EOP) {
                    // Check Package and Wait
                    if (waitForNotification) {
                        if (dataRead[1] % 2 == 0) {
                            finish();
                        } else {
                            checkIsAValidRequest(dataRead);
                        }
                    } else {
                        checkIsAValidRequest(dataRead);
                        finish();
                    }
                    dataRead = [];
                }
            };
            characteristic.removeAllListeners('data');
            characteristic.on('data', listenerF);
            characteristic.write(Buffer.from(buff));
        });
    }

    // Used only for debug
    _general_mess(data, params=[], wait=false, timeout=0) {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(data, params),
            wait,
            timeout
        );
    }

    connect() {
        return new Promise((resolve, reject) => {
            this._findPeripheral().then((peripheral) => {
                peripheral.connect( (e) => {
                    peripheral.discoverServices([CONNECT_SERVICE], (error, services) => {
                        services[0].discoverCharacteristics([CONNECT_CHAR], (error, characteristics) => {
                            this._connectChar = characteristics[0];
                            this._connectChar.write(Buffer.from(MSG_CONNECTION), true, (error) => {
                                peripheral.discoverServices([SPECIAL_SERVICE], (error, services) => {
                                    services[0].discoverCharacteristics([SPECIAL_CHAR], (error, characteristics) => {
                                        this._specialChar = characteristics[0];
                                        this._specialChar.subscribe(error => {
                                            if (error) {
                                                console.error('Error subscribing to char.');
                                            }
                                        });
                                        this._writePacket(
                                            this._specialChar,
                                            this._buildPacket(MSG_INIT),
                                            true,
                                            5000
                                        ).then(() => {
                                            resolve(true);
                                        })
                                    });
                                });
                            });
                        });
                    });
                });
            });

        });
    }

    animate(animationId) {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(MSG_ANIMATION, [0x00, animationId]),
            true
        );
    }

    _convertDegreeToHex(degree) {
        var view = new DataView(new ArrayBuffer(4));
        view.setFloat32(0, degree);
        return Array
            .apply(null, { length: 4 })
            .map((_, i) => view.getUint8(i))

    }

    rotateTop(degree) {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(MSG_ROTATE, this._convertDegreeToHex(degree)),
            false,
        );
    }

    openCarriage() {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(MSG_CARRIAGE, [0x01]),
            false,
            2000
        );
    }

    closeCarriage() {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(MSG_CARRIAGE, [0x02]),
            false,
            2000
        );
    }

    off() {
        return this._writePacket(
            this._specialChar,
            this._buildPacket(MSG_OFF),
            true
        );
    }

};


module.exports = R2D2;
