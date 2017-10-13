// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");

module.exports = function() {
  let fsLook = {};

  fsLook.getSizesUnder = path => new Promise(function(resolve, reject) {
    fs.readdir(path, function(err, files) {
      if (err) reject(err);

      else {
        let result = new Map();
        let statPromises = [];

        for (let f of files) {
          statPromises.push(new Promise(function(good, bad) {
            let fPath = path + "/" + f;

            fs.stat(fPath, function(error, stats) {
              if (error)
                bad(error);
              else {
                result.set(fPath, stats.size);
                good();
              }
            });
          }));
        }

        Promise.all(statPromises).then(function() {
          resolve(result);
        }, reject);
      }
    });
  });

  return fsLook;
};
