// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = n => new Promise(function(resolve, reject) {
    internal.tick(n, Promise.resolve()).then(resolve, reject);
  });

  Ticker.at = function(n, callback) {
    if (!internal.callbacks.has(n))
      internal.callbacks.set(n, []);

    internal.callbacks.get(n).push(callback);
  };

  internal.callbacks = new Map();
  internal.counter = 0;

  internal.tick = function(n, promise) {
    if (typeof n === "undefined")
      n = 1;

    for (let i = 0; i < n; i += 1) {
      internal.counter += 1;
      promise = internal.runScheduledCallbacks(promise);
    }

    return promise;
  };

  internal.runScheduledCallbacks = function(promise) {
    for (let callback of internal.getCallbacks())
      promise = internal.appendPromise(promise, callback);

    return promise;
  };

  internal.getCallbacks = function() {
    if (internal.callbacks.has(internal.counter))
      return internal.callbacks.get(internal.counter);

    else
      return [];
  };

  internal.appendPromise = function(promise, callback) {
    return new Promise(function(resolve, reject) {
      promise.then(function() {
        try {
          Promise.resolve(callback()).then(resolve, reject);

        } catch(error) {
          reject(error);
        }
      }, reject);
    });
  };

  return Ticker;
};
