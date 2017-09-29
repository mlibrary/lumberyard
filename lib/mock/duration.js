// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(landscape) {
  let doSomething = false;

  return {
    "tick": () => new Promise(function(resolve, reject) {
      try {
        if (doSomething)
          landscape.push("hi");

        resolve();

      } catch(error) {
        reject(error);
      }
    }),

    "at": function(marker, method) {
      doSomething = true;
    }
  };
};
