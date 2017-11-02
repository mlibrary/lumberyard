// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fsWatcher = require("./fs-watcher");
const tick = require("./tick");

module.exports = function(parameters) {
  let internal = {};

  if (typeof parameters === "undefined")
    parameters = {};

  if (typeof parameters.watcher === "undefined")
    internal.watcher = fsWatcher();

  else
    internal.watcher = parameters.watcher;

  if (typeof parameters.tick === "undefined")
    internal.tick = tick;

  else
    internal.tick = parameters.tick;

  return function(taskObject) {
    let tasks = objToMap(taskObject);
    let idleTasks = new Set(tasks.keys());
    let numberOfRunningTasks = 0;

    let runSome = () => new Promise(function(resolve, reject) {
      findAll(idleTasks).then(results => {
        for (let keypair of results)
          if (keypair[1].length > 0)
            runTask(keypair[0]).catch(reject);

        lookAgainLater(resolve, reject);

      }, reject);
    });

    let findAll = idSet => new Promise(function(resolve, reject) {
      let searches = [];

      idSet.forEach(id => {
        searches.push(findWithId(id));
      });

      Promise.all(searches).then(resolve, reject);
    });

    let findWithId = id => new Promise(function(resolve, reject) {
      tasks.get(id).find().then(files => {
        resolve([id, files]);
      }, reject);
    });

    let runTask = function(id) {
      let task = tasks.get(id);

      numberOfRunningTasks += 1;
      idleTasks.delete(id);

      return new Promise(function(resolve, reject) {
        internal.watcher(task.find).then(files => {
          task.move(files).then(pwd => {
            idleTasks.add(id);

            task.run(pwd).then(() => {
              numberOfRunningTasks -= 1;
              resolve();
            }, reject);
          }, reject);
        }, reject);
      });
    };

    let lookAgainLater = function(resolve, reject) {
      if (numberOfRunningTasks === 0)
        resolve();

      else
        internal.tick(30).then(() => {
          runSome().then(resolve, reject);
        }, reject);
    };

    return runSome();
  };
};

let objToMap = obj => {
  let result = new Map();

  for (let key in obj)
    if (obj.hasOwnProperty(key))
      result.set(key, obj[key]);

  return result;
};
