"use strict";


class Droid {

    constructor (address=null) {
        this._address = address;
        this._seq = 0x00;
    }

    connect() {
        console.log("Searching for " + this.constructor.name + " droid...");
        if (this._address) {
            console.log("Looking for a specific address " + this._address)
        }
    }

};


module.exports = Droid;
