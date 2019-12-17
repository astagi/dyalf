# DYALF

Droids You Are Looking For - A Node.js Library to interact with Sphero droids 🤖

## Install

TODO

## Usage

```js
const dyalf = require('./dyalf');


var r2 = new dyalf.R2D2();

var main = async () => {
    await r2.connect();
    await r2.animate(7);
    await r2.openCarriage();
    await r2.closeCarriage();
    await r2.off();
    console.log('FINISH ALL');
};

main();
```

