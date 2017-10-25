// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fsWatcher = require("./fs-watcher");

module.exports = function(parameters) {
  let internal = {};

  if (typeof parameters === "undefined")
    parameters = {};

  if (typeof parameters.watcher === "undefined")
    internal.watcher = fsWatcher();

  else
    internal.watcher = parameters.watcher;

  return taskObject => new Promise(function(resolve, reject) {
    let searches = [];

    for (let id in taskObject)
      if (taskObject.hasOwnProperty(id))
        searches.push(taskObject[id].find());

    Promise.all(searches).then(resolve, reject);
  });
};
