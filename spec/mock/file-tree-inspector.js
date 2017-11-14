// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const crypto = require("crypto");

module.exports = function() {
  const inspector = {};
  const fakeFS = new Map();

  inspector.getSizesUnder = path => new Promise(function(resolve, reject) {
    const sizes = new Map();

    fakeFS.forEach((data, filePath) => {
      if (filePath.startsWith(path))
        sizes.set(filePath, data.length);
    });

    resolve(sizes);
  });

  inspector.getChecksum = path => new Promise(function(resolve, reject) {
    if (fakeFS.has(path))
      resolve(crypto
        .createHash("md5")
        .update(fakeFS.get(path))
        .digest("latin1"));

    else
      reject(Error("Does not exist: " + path));
  });

  return {
    "fs": fakeFS,
    "inspector": inspector
  };
};
