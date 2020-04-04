"use strict";


const dyalf = require('../dyalf');


let main = async () => {

  let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');

  console.log('🤖 Start connection...');
  await r2.connect();
  await r2.openCarriage();
  await r2.wait(1000);

  await r2.move(0xFF, 0x00, 3000);
  await r2.wait(1000);
  await r2.move(0xFF / 2, 0xB4, 3000, dyalf.R2D2.BACKWARD);
  console.log('⭕️ Rotate the top!');

  for (var i = -160; i < 180; i += 10) {
    await r2.rotateTop(i);
  }

  await r2.stop();

  console.log('🔌 Turn the droid off');
  await r2.wait(1000);
  await r2.off();

  dyalf.shutdown();

};

main();
