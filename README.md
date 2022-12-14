# Dyalf

A Node.js Library to interact with Star Wars [Sphero](https://www.sphero.com/starwars?utm_source=rss&utm_medium=rss) droids 🤖

## Pair droids with your device

To pair droids with your device for the first time, you need an external tool to find UUID. I use

```sh
node blescanner.js
```

included in this library.

## Usage

```js
const dyalf = require('./dyalf');


let r2 = new dyalf.R2D2('4bef2b0786334e2fac126c55f7f2d057');


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

## Troubleshooting

Use @abandonware/noble npm package to avoid the xpc-connection error.

#### MacOS won't connect to the droid

Restart your Mac is a valid option! Alternatively:

- Turn off Bluetooth
- Run the following code in your shell

```sh
rm -v ~/Library/Preferences/ByHost/com.apple.Bluetooth.*.plist
sudo rm /Library/Preferences/com.apple.Bluetooth.plist
```

- Turn Bluetooth back on

You can automate this procedure using [blueutil](http://www.frederikseiffert.de/blueutil/):

```sh
blueutil off
rm -v ~/Library/Preferences/ByHost/com.apple.Bluetooth.*.plist
sudo rm /Library/Preferences/com.apple.Bluetooth.plist
blueutil on
```

## License

MIT - Copyright (c) Andrea Stagi
