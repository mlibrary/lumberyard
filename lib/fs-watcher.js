// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(parameters) {
  let internal = {};

  if (typeof parameters.tick === "undefined")
    internal.tick = n => Promise(resolve => {
      setTimeout(() => { resolve(); }, n*1000);
    });

  else
    internal.tick = parameters.tick;

  return findFiles => new Promise(function(resolve, reject) {
    resolve(findFiles());
  });
};
