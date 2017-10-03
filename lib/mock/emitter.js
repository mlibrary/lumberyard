// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  let callbacks = new Map();
  let emitter = {};

  emitter.emit = function(theEvent) {
    if (callbacks.has(theEvent))
      callbacks.get(theEvent)();
  };

  emitter.on = function(theEvent, callback) {
    callbacks.set(theEvent, callback);
  };

  return emitter;
};
