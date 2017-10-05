// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(landscape) {
  let actions = new Map();
  let tickCount = 0;

  let tickOnce = () => new Promise(function(resolve, reject) {
    tickCount += 1;

    let runAllActions = Promise.resolve();

    for (let action of actions.get(tickCount) || [])
      runAllActions = new Promise(function(done) {
        runAllActions.then(function() {
          try {
            Promise.resolve(
              landscape[action.method].apply(landscape, action.args)
            ).then(done, reject);

          } catch(error) {
            reject(error);
          }
        }, reject);
      });

    runAllActions.then(resolve, reject);
  });

  return {
    "tick": n => new Promise(function(resolve, reject) {
      let allTicks = Promise.resolve();
      if (typeof n === "undefined") n = 1;

      for (; n > 0; n -= 1)
        allTicks = allTicks.then(tickOnce, reject);

      allTicks.then(resolve, reject);
    }),

    "at": function(when, method, ...args) {
      if (!actions.has(when))
        actions.set(when, []);

      actions.get(when).push({
        "when": when,
        "method": method,
        "args": args
      });
    }
  };
};
