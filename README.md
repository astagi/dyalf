# DYALF

Droids You Are Looking For - A Node.js Library to interact with [Sphero](https://www.sphero.com/starwars?utm_source=rss&utm_medium=rss) droids 🤖

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

## License

MIT - Copyright (c) Andrea Stagi
