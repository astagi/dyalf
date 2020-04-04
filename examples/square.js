"use strict";


const dyalf = require('../dyalf');


let main = async () => {

  let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');

  console.log('🤖 Start connection...');
  await r2.connect();
  await r2.openCarriage();

  console.log('🔳 Make a square');
  for (let i = 0; i < 4; i++) {
    await r2.move(0xFF, i * 90, 1000);
  }

  await r2.stop();

  console.log('🔌 Turn the droid off');
  await r2.wait(1000);
  await r2.off();

  dyalf.shutdown();

};

main();
