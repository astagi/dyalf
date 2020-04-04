"use strict";


const dyalf = require('../dyalf');


let main = async () => {

  let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');

  r2.on('accelerometer', (x, y, z) => {
    console.log('------------------------');
    console.log('X: ', x);
    console.log('Y: ', y);
    console.log('Z: ', z);
  });

  console.log('🤖 Start connection...');
  await r2.connect();

  await r2.wait(7000);

  console.log('🔌 Turn the droid off');
  await r2.off();

  dyalf.shutdown();

};

main();
