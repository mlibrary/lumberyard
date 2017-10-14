// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  fsMock = {};

  fsMock.getSizesUnder = () => new Promise(function(resolve, reject) {
    resolve();
  });

  return fsMock;
};
