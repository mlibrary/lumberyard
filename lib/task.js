// Copyright (c) 2018 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");
const makePromise = require("./make-promise");
const randomString = require("./random-string");
console.log(randomString);

const readdir = makePromise(fs.readdir);
const mkdir = makePromise(fs.mkdir);

module.exports = function(watchDir, runDirFormat) {
  const task = {};

  task.find = () => new Promise(function(resolve, reject) {
    readdir(watchDir).then(files => {
      const result = [];

      for (const file of files)
        result.push(watchDir + "/" + file);

      resolve(result);
    }, reject);
  });

  task.move = () => new Promise(function(resolve, reject) {
    const path = randomString(runDirFormat);

    mkdir(path).then(() => {
      resolve(path);
    }, reject);
  });

  return task;
};
