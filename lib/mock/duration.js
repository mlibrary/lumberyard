// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(landscape) {
  let actions = new Map();
  let tickCount = 0;
  let thingToDo = [];

  return {
    "tick": () => new Promise(function(resolve, reject) {
      try {
        tickCount += 1;

        if (thingToDo.length > 0) {
          let thing = thingToDo.pop();
          landscape[thing.method].apply(landscape, thing.args);
        }

        resolve();

      } catch(error) {
        reject(error);
      }
    }),

    "at": function(when, method) {
      thingToDo.push({
        "when": when,
        "method": method,
        "args": [...arguments].slice(2)
      });

      actions.set(when, {
        "when": when,
        "method": method,
        "args": [...arguments].slice(2)
      });
    }
  };
};
