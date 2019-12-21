# Dyalf

A Node.js Library to interact with Star Wars [Sphero](https://www.sphero.com/starwars?utm_source=rss&utm_medium=rss) droids 🤖

## Usage

```js
const dyalf = require('./dyalf');


let r2 = new dyalf.R2D2('d7:1b:52:17:7b:d6');

let main = async () => {
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
