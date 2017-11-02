// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(functionWithCallback) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      functionWithCallback(...args, fakeCallback(resolve, reject));
    });
  };
};

let fakeCallback = (resolve, reject) => (error, result) => {
  if (error)
    reject(error);

  else
    resolve(result);
};
