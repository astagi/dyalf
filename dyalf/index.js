"use strict";
const noble = require('noble');


module.exports = {
  Droid: require('./droid'),
  R2D2: require('./r2d2'),
  BB8: require('./bb8'),
  shutdown: () => {
    noble.stopScanning();
    process.exit();
  }
};
