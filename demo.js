"use strict";


const dyalf = require('./dyalf');


let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');
let bb8 = new dyalf.BB8('0de8f0b2af0b4aa684e136441052f333');

let main = async () => {

    await bb8.connect();
    await r2.connect();
    await r2.openCarriage();
    await r2.closeCarriage();
    await r2.sleep(1000);
    await r2.animate(7);

    for (var i = -160; i < 180; i += 5) {
        await r2.rotateTop(i);
    }

    await r2.sleep(1000);
    await r2.off();
    await bb8.off();

    dyalf.shutdown();

};


main();
