// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  Ticker = {};
  internal = {};

  Ticker.tick = () => new Promise(function(resolve, reject) {
    if (internal.callback)
      internal.callback();

    resolve();
  });

  Ticker.at = function(n, callback) {
    internal.callback = callback;
  };

  return Ticker;
};
