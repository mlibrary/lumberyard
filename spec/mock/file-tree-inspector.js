// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  inspector = {};
  fakeFS = new Map();

  inspector.getSizesUnder = path => new Promise(function(resolve, reject) {
    let sizes = new Map();

    fakeFS.forEach((data, filePath) => {
      if (filePath.startsWith(path))
        sizes.set(filePath, data.length);
    });

    resolve(sizes);
  });

  inspector.getChecksum = path => new Promise(function(resolve, reject) {
    if (fakeFS.has(path))
      resolve();

    else
      reject();
  });

  return {
    "fs": fakeFS,
    "inspector": inspector
  };
};
