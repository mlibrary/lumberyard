// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = () => new Promise(function(resolve, reject) {
    for (callback of internal.callbacks)
      callback();

    resolve();
  });

  Ticker.at = function(n, callback) {
    if (n == 1)
      internal.callbacks.push(callback);
  };

  internal.callbacks = [];

  return Ticker;
};
