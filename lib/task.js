// Copyright (c) 2018 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");
const makePromise = require("../lib/make-promise");

const readdir = makePromise(fs.readdir);

module.exports = function(watchDir) {
  const task = {};

  task.find = () => new Promise(function(resolve, reject) {
    readdir(watchDir).then(files => {
      const result = [];

      for (const file of files)
        result.push(watchDir + "/" + file);

      resolve(result);
    });
  });

  return task;
};
