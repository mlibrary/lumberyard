// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = () => new Promise(function(resolve, reject) {
    internal.counter += 1;

    if (internal.callbacks.has(internal.counter))
      for (callback of internal.callbacks.get(internal.counter))
        callback();

    resolve();
  });

  Ticker.at = function(n, callback) {
    if (!internal.callbacks.has(n))
      internal.callbacks.set(n, []);

    internal.callbacks.get(n).push(callback);
  };

  internal.callbacks = new Map();
  internal.counter = 0;

  return Ticker;
};
