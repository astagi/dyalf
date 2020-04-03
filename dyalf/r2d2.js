"use strict";

const utils = require('./utils')
const Droid = require('./droid');

const CONNECT_SERVICE = "00020001574f4f2053706865726f2121";
const CONNECT_CHAR = "00020005574f4f2053706865726f2121";
const SPECIAL_SERVICE = "00010001574f4f2053706865726f2121";
const SPECIAL_CHAR = "00010002574f4f2053706865726f2121";

const MSG_CONNECTION = [0x75, 0x73, 0x65, 0x74, 0x68, 0x65, 0x66, 0x6F, 0x72, 0x63, 0x65, 0x2E, 0x2E, 0x2E, 0x62, 0x61, 0x6E, 0x64];
const MSG_INIT = [0x0A, 0x13, 0x0D];
const MSG_ROTATE = [0x0A, 0x17, 0x0F];
const MSG_ANIMATION = [0x0A, 0x17, 0x05];
const MSG_CARRIAGE = [0x0A, 0x17, 0x0D];
const MSG_MOVE = [0x0A, 0x16, 0x07]
const MSG_OFF = [0x0A, 0x13, 0x01];
const MSG_ACCELEROMETER = [0x0A, 0x18, 0x00];

const ESC = 0xAB;
const SOP = 0x8D;
const EOP = 0xD8;
const ESC_ESC = 0x23;
const ESC_SOP = 0x05;
const ESC_EOP = 0x50;

const CONVERSIONS = {
  INTEGER: 'i',
  FLOAT: 'f',
}


class R2D2 extends Droid {

  constructor(address = null) {
    super(address);
    this._heading = 0;
  }

  _encodePacketBody(payload) {
    let packetEncoded = [];
    for (let i = 0; i < payload.length; i++) {
      if (payload[i] == ESC) {
        packetEncoded.push(...[ESC, ESC_ESC]);
      } else if (payload[i] == SOP) {
        packetEncoded.push(...[ESC, ESC_SOP]);
      } else if (payload[i] == EOP) {
        packetEncoded.push(...[ESC, ESC_EOP]);
      } else {
        packetEncoded.push(payload[i])
      }
    }
    return packetEncoded;
  }

  _convertDegreesToHex(degree, format = CONVERSIONS.INTEGER) {
    var view = new DataView(new ArrayBuffer(4));
    format === CONVERSIONS.FLOAT ? view.setFloat32(0, degree) : view.setUint16(0, degree)
    return Array
      .apply(null, {
        length: format === CONVERSIONS.FLOAT ? 4 : 2
      })
      .map((_, i) => view.getUint8(i))
  }

  _buildPacket(init, payload = []) {
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

  _enableAccelerometerInspection(characteristic) {
    let dataRead = [];
    let dataToCheck = [];
    let eopPosition = -1;
    characteristic.write(
      Buffer.from(
        this._buildPacket(MSG_ACCELEROMETER, [0x00, 0x96, 0x00, 0x00, 0x07, 0xe0, 0x78])
      )
    );
    characteristic.on('data', (data) => {
      dataRead.push(...data);
      eopPosition = dataRead.indexOf(EOP);
      dataToCheck = dataRead.slice(0);
      if (eopPosition !== dataRead.length - 1) {
        dataRead = dataRead.slice(eopPosition + 1);
      } else {
        dataRead = [];
      }
      if (eopPosition !== -1) {
        if (dataToCheck.slice(0, 5).every((v) => [0x8D, 0x00, 0x18, 0x02, 0xFF].indexOf(v) >= 0)) {
          // Decode packet
          let packetDecoded = [];
          for (let i = 0; i < dataToCheck.length - 1; i++) {
            if (dataToCheck[i] == ESC && dataToCheck[i + 1] == ESC_ESC) {
              packetDecoded.push(ESC);
              i++;
            } else if (dataToCheck[i] == ESC && dataToCheck[i + 1] == ESC_SOP) {
              packetDecoded.push(SOP);
              i++;
            } else if (dataToCheck[i] == ESC && dataToCheck[i + 1] == ESC_EOP) {
              packetDecoded.push(EOP);
              i++;
            } else {
              packetDecoded.push(dataToCheck[i])
            }
          }

          let x = Buffer.from(packetDecoded.slice(5, 9)).readFloatBE(0);
          let y = Buffer.from(packetDecoded.slice(9, 13)).readFloatBE(0);
          let z = Buffer.from(packetDecoded.slice(13, 17)).readFloatBE(0);
          this.emit('accelerometer', x, y, z);
        }
      }
    });
  }

  _writePacket(characteristic, buff, waitForNotification = false, timeout = 0) {
    return new Promise((resolve, reject) => {
      let dataRead = [];
      let dataToCheck = [];
      let eopPosition = -1;

      let checkIsAValidRequest = (dataRead) => {
        if (dataRead[5] != 0x00) {
          characteristic.removeListener('data', listenerForRead);
          reject(dataRead[5]);
        }
      }

      let finish = () => {
        dataRead = [];
        setTimeout(() => {
          characteristic.removeListener('data', listenerForRead);
          resolve(true);
        }, timeout);
      }

      let isActionResponse = (data) => {
        let valid = false;
        valid |= data.slice(0, 2).every((v) => [0x8D, 0x09].indexOf(v) >= 0);
        valid |= data.slice(0, 2).every((v) => [0x8D, 0x08].indexOf(v) >= 0);
        valid |= data.slice(0, 3).every((v) => [0x8D, 0x00, 0x17].indexOf(v) >= 0);
        return valid;
      }

      let listenerForRead = (data, isNotification) => {
        dataRead.push(...data)
        eopPosition = dataRead.indexOf(EOP);
        dataToCheck = dataRead.slice(0);
        if (eopPosition !== dataRead.length - 1) {
          dataRead = dataRead.slice(eopPosition + 1);
        } else {
          dataRead = [];
        }
        if (eopPosition !== -1) {
          // Check Package and Wait
          if (isActionResponse(dataToCheck)) {
            if (waitForNotification) {
              if (dataToCheck[1] % 2 == 0) {
                finish();
              } else {
                checkIsAValidRequest(dataToCheck);
              }
            } else {
              checkIsAValidRequest(dataToCheck);
              finish();
            }
          }
        }
      };
      characteristic.on('data', listenerForRead);
      characteristic.write(Buffer.from(buff));
    });
  }

  // Used only for debug
  _general_mess(data, params = [], wait = false, timeout = 0) {
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
        peripheral.connect((error) => {
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
                      this._enableAccelerometerInspection(this._specialChar);
                      resolve(true);
                    }).catch(err => console.log(err))
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

  async move(speed, heading, time, direction = 0x00) {
    this._heading = heading;
    let stop = false;
    setTimeout(() => {
      stop = true;
    }, time)
    while (!stop) {
      await this._writePacket(
        this._specialChar,
        this._buildPacket(
          MSG_MOVE, [speed, ...this._convertDegreesToHex(heading), direction]
        )
      );
    }
  }

  stop() {
    return this._writePacket(
      this._specialChar,
      this._buildPacket(
        MSG_MOVE, [0x00, ...this._convertDegreesToHex(this._heading), 0x00]
      )
    );
  }

  heading(heading) {
    this._heading = heading;
    this.move(0x00, heading, 0, 0x00);
  }

  rotateTop(degrees) {
    return this._writePacket(
      this._specialChar,
      this._buildPacket(
        MSG_ROTATE,
        this._convertDegreesToHex(degrees, CONVERSIONS.FLOAT)
      ),
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
