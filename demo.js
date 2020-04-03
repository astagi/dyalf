"use strict";


const dyalf = require('./dyalf');


let main = async () => {

  let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');

  r2.on('accelerometer', (x, y, z) => {
    //console.log(x, y, z);
  });

  console.log('🤖 Start connection...');
  await r2.connect();
  await r2.openCarriage();
  await r2.wait(1000);

  console.log('🔳 Make a square');
  for (let i = 0; i < 4; i++) {
    await r2.move(0xFF, i * 90, 1000);
  }

  await r2.stop();

  console.log('⭕️ Rotate the top!');

  for (var i = -160; i < 180; i += 5) {
    await r2.rotateTop(i);
  }

  console.log('🔌 Turn the droid off');
  await r2.wait(1000);
  await r2.off();

  dyalf.shutdown();

};


main();
