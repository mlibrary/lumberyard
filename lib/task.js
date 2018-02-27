// Copyright (c) 2018 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");
const makePromise = require("./make-promise");
const randomString = require("./random-string");

const mkdir = makePromise(fs.mkdir);
const readdir = makePromise(fs.readdir);
const rename = makePromise(fs.rename);
const stat = makePromise(fs.stat);

module.exports = function(watchDir, runDirFormat, runFunction) {
  const task = {};

  task.find = () => new Promise(function(resolve, reject) {
    readdir(watchDir).then(files => {
      const result = [];

      for (const file of files)
        result.push(watchDir + "/" + file);

      resolve(result);
    }, reject);
  });

  task.move = listOfFiles => new Promise(function(resolve, reject) {
    const path = randomString(runDirFormat);

    stat(path).catch(() => {
      return mkdir(path);
    }).then(() => {
      const movements = [];

      for (const filename of listOfFiles)
        movements.push(rename(filename,
                              path + filename.slice(watchDir.length)));

      Promise.all(movements).then(() => {
        resolve(path);
      }, reject);
    }, reject);
  });

  task.run = runFunction;

  return task;
};
