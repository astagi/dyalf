# Dyalf

A Node.js Library to interact with Star Wars [Sphero](https://www.sphero.com/starwars?utm_source=rss&utm_medium=rss) droids 🤖

## Pair droids with your device

To pair droids with your device for the first time, you need an external tool to find UUID. I use

```bash
node blescanner.js

```

included in this library.

## Usage

```js
const dyalf = require('./dyalf');


let r2 = new dyalf.R2D2('d7:1b:52:17:7b:d6');


let main = async () => {
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
```

## License

MIT - Copyright (c) Andrea Stagi
