// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  inspector = {};
  fakeFS = new Map();

  inspector.getSizesUnder = () => new Promise(function(resolve, reject) {
    let sizes = new Map();

    fakeFS.forEach((data, path) => {
      sizes.set(path, data.length);
    });

    resolve(sizes);
  });

  return {
    "fs": fakeFS,
    "inspector": inspector
  };
};
