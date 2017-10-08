// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = () => new Promise(function(resolve, reject) {
    if (internal.callbacks.length > 0)
      internal.callbacks[0]();

    resolve();
  });

  Ticker.at = function(n, callback) {
    internal.callbacks.push(callback);
  };

  internal.callbacks = [];

  return Ticker;
};
