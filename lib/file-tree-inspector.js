// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");

let readdir = path => new Promise(function(resolve, reject) {
  fs.readdir(path, function(error, files) {
    if (error)
      reject(error);
    else
      resolve(files);
  });
});

let fileSize = path => new Promise(function(resolve, reject) {
  fs.stat(path, function(error, stats) {
    if (error)
      reject(error);

    else {
      if (stats.isDirectory()) {
        let recurse = new Map();

        readdir(path).then(files => {
          let sizes = [];

          files.forEach(filename => {
            sizes.push(fileSize(path + "/" + filename));
          });

          Promise.all(sizes).then(sizeMaps => {
            sizeMaps.forEach(sizeMap => {
              sizeMap.forEach((childSize, childPath) => {
                recurse.set(childPath, childSize);
              });
            });

            resolve(recurse);

          }, reject);
        }, reject);
      }

      else
        resolve(new Map([[path, stats.size]]));
    }
  });
});

module.exports = function() {
  let fsLook = {};

  fsLook.getSizesUnder = path => new Promise(function(resolve, reject) {
    readdir(path).then(files => {
      let statPromises = [];

      for (let f of files)
        statPromises.push(fileSize(path + "/" + f));

      Promise.all(statPromises).then(values => {
        let result = new Map();

        for (v of values) {
          v.forEach((value, key) => {
            result.set(key, value);
          });
        }

        resolve(result);
      }, reject);
    }, reject);
  });

  return fsLook;
};
