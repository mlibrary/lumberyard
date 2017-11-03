// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const crypto = require("crypto");
const fs = require("fs");
const makePromise = require("./make-promise");

let md5sum = path => new Promise(function(resolve, reject) {
  let hash = crypto.createHash("md5");
  let stream = fs.createReadStream(path);

  stream.on("data", data => {
    hash.update(data, "utf8");
  });

  stream.on("end", () => {
    resolve(hash.digest("latin1"));
  });

  stream.on("error", error => {
    reject(error);
  });
});

let readdir = makePromise(fs.readdir);

let fileSize = path => new Promise(function(resolve, reject) {
  let quietReject = () => {
    resolve(new Map());
  };

  fs.stat(path, function(error, stats) {
    if (error)
      quietReject();

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
        }, quietReject);
      }

      else
        resolve(new Map([[path, stats.size]]));
    }
  });
});

module.exports = () => ({
  "getChecksum": md5sum,
  "getSizesUnder": fileSize
});
