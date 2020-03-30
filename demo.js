"use strict";


const dyalf = require('./dyalf');


let main = async () => {

  let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');

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

  dyalf.shutdown();

};


main();
