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

  internal.lookAgain = (findFiles, previousMap) => {
    return new Promise(function(resolve, reject) {
      internal.gatherSizeMapping(findFiles).then(sizes => {
        if (previousMap.size == sizes.size) {
          let foundMismatch = false;

          for (let key of sizes.keys()) {
            if (sizes.get(key) === previousMap.get(key))
              continue;

            foundMismatch = true;
            break;
          }

          if (foundMismatch)
            internal.tick().then(() => {
              internal.lookAgain(findFiles, sizes).then(resolve, reject);
            }, reject);

          else
            findFiles().then(resolve, reject);
        }

        else
          internal.tick().then(() => {
            internal.lookAgain(findFiles, sizes).then(resolve, reject);
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

  return findFiles => new Promise(function(resolve, reject) {
    internal.lookAgain(findFiles, new Map()).then(resolve, reject);
  });
};
