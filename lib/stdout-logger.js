// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const processTree = require("./process-tree");
const logTree = require("./log-tree");

let bulletlog = function(color) {
  return function(message) {
    console.log("\x1b[" + color + "m *\x1b[0m " + message);
  };
};

let echogood = bulletlog("1;32");

let stdoutLogger = function(inputTree) {
  let logger = {};
  let tree = logTree(inputTree);

  let say = function(message) {
    echogood(message + " ("
      + tree.num().toString() + "/"
      + tree.den().toString() + ")");
  };

  say("Finished setup and validation");

  logger.log = function(message) {
    let description = tree.complete(message);

    if (message[1] === "done")
      say(description);
  };

  logger.storeProcess = function(promise) {
    logger.promise = promise;
    logger.promise.then(function(value) { echogood("Done"); });
  };

  return logger;
};

module.exports = function(firstArg, setUp) {
  if (setUp)
    return processTree(firstArg, setUp);

  else
    return processTree(stdoutLogger, firstArg);
};
