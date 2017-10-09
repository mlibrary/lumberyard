// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = n => new Promise(function(resolve, reject) {
    let promise = Promise.resolve();

    if (typeof n === "undefined")
      n = 1;

    for (let i = 0; i < n; i += 1) {
      internal.counter += 1;

      if (internal.callbacks.has(internal.counter))
        for (let callback of internal.callbacks.get(internal.counter))
          promise = internal.appendPromise(promise, callback);
    }

    promise.then(resolve);
  });

  Ticker.at = function(n, callback) {
    if (!internal.callbacks.has(n))
      internal.callbacks.set(n, []);

    internal.callbacks.get(n).push(callback);
  };

  internal.callbacks = new Map();
  internal.counter = 0;

  internal.appendPromise = function(promise, callback) {
    return new Promise(function(done) {
      promise.then(function() {
        Promise.resolve(callback()).then(done);
      });
    });
  };

  return Ticker;
};
