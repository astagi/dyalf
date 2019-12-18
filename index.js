"use strict";


const dyalf = require('./dyalf');


let r2 = new dyalf.R2D2('d7:1b:52:17:7b:d6');

let main = async () => {

    await r2.connect();
    await r2.openCarriage();
    await r2.animate(7);

    for (var i = -160 ; i < 180 ; i++) {
        await r2.rotateTop(i);
    }

    await r2.closeCarriage();
    await r2.off();

};


main();
