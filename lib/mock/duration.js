// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(landscape) {
  let actions = new Map();
  let tickCount = 0;

  return {
    "tick": () => new Promise(function(resolve, reject) {
      try {
        tickCount += 1;

        if (actions.has(tickCount)) {
          let thing = actions.get(tickCount);
          landscape[thing.method].apply(landscape, thing.args);
        }

        resolve();

      } catch(error) {
        reject(error);
      }
    }),

    "at": function(when, method) {
      actions.set(when, {
        "when": when,
        "method": method,
        "args": [...arguments].slice(2)
      });
    }
  };
};
