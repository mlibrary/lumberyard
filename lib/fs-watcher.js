// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const FileTreeInspector = require("./file-tree-inspector");

module.exports = function(parameters) {
  let internal = {};

  if (typeof parameters.tick === "undefined")
    internal.tick = n => Promise(resolve => {
      setTimeout(() => { resolve(); }, n*1000);
    });

  else
    internal.tick = parameters.tick;

  if (typeof parameters.inspector === "undefined")
    internal.inspector = FileTreeInspector();

  else
    internal.inspector = parameters.inspector;

  internal.lookAgain = (findFiles, previousMap, checksums) => {
    return new Promise(function(resolve, reject) {
      internal.gatherSizeMapping(findFiles).then(sizes => {
        let equalSoFar = (previousMap.size === sizes.size);

        if (equalSoFar) {
          for (let key of sizes.keys()) {
            if (sizes.get(key) === previousMap.get(key))
              continue;

            equalSoFar = false;
            break;
          }
        }

        if (equalSoFar)
          internal.compareChecksums(findFiles,
                                    sizes,
                                    checksums,
                                    1).then(resolve, reject);

        else
          internal.tick().then(() => {
            internal.lookAgain(findFiles,
                               sizes,
                               checksums).then(resolve, reject);
          }, reject);

      }, reject);
    });
  };

  internal.gatherSizeMapping = findFiles => {
    return new Promise(function(resolve, reject) {
      findFiles().then(paths => {
        let mapPromises = [];

        for (let path of paths)
          mapPromises.push(internal.inspector.getSizesUnder(path));

        Promise.all(mapPromises).then(maps => {
          let combinedMaps = new Map();

          for (let map of maps)
            map.forEach((size, path) => {
              combinedMaps.set(path, size);
            });

          resolve(combinedMaps);

        }, reject);
      }, reject);
    });
  };

  internal.compareChecksums = (findFiles, sizes, previousSums, n) => {
    if (n < 1)
      return findFiles();

    return new Promise(function(resolve, reject) {
      let collectingChecksums = [];

      for (let path of sizes.keys())
        collectingChecksums.push(internal.getChecksum(path));

      Promise.all(collectingChecksums).then(results => {
        let currentSums = new Map();

        for (let checksum of results) {
          currentSums.set(checksum.path, checksum.sum);
        }

        let equalSoFar = (previousSums.size === currentSums.size);

        if (equalSoFar) {
          for (let key of currentSums.keys()) {
            if (currentSums.get(key) === previousSums.get(key))
              continue

            equalSoFar = false;
            break;
          }
        }

        if (equalSoFar)
          internal.tick().then(() => {
            internal.compareChecksums(findFiles,
                                      sizes,
                                      currentSums,
                                      n-1).then(resolve, reject);
          });

        else
          internal.lookAgain(findFiles,
                             sizes,
                             currentSums).then(resolve, reject);

      }, reject);
    });
  };

  internal.getChecksum = path => new Promise(function(resolve, reject) {
    internal.inspector.getChecksum(path).then(checksum => {
      resolve({"path": path, "sum": checksum});
    }, reject);
  });

  return findFiles => new Promise(function(resolve, reject) {
    internal.lookAgain(findFiles,
                       new Map(),
                       new Map()).then(resolve, reject);
  });
};
