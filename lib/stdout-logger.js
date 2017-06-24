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
let echowarn = bulletlog("1;33");
let echobad = bulletlog("1;31");

let stdoutLogger = function(inputTree) {
  let logger = {};
  let tree = logTree(inputTree);

  let say = function(message) {
    echogood(message + " ("
      + tree.num().toString() + "/"
      + tree.den().toString() + ") ...");
  };

  say("Finished setup and validation");

  logger.log = function(message) {
    let description = tree.complete(message);

    switch(message[1]) {
      case "done":
        say(description);
        break;

      case "info":
        echogood(description);
        break;

      case "warn":
        echowarn(description);
        break;

      case "error":
        echobad(description);
        break;
    }
  };

  logger.storeProcess = function(promise) {
    logger.promise = promise;
    logger.promise.then(function(value) {
      echogood("Done.");

    }, function(error) {
      echobad(error);
    });
  };

  return logger;
};

let walkError = function(error, indent) {
  echobad(indent + (error.description || "") + ":");

  for (let message of error.messages)
    echobad(indent + "  " + message);

  for (let child of error.children)
    walkError(child, indent + "  ");
};

module.exports = function(setUp) {
  echogood("Beginning setup and validation ...");
  processTree(stdoutLogger, setUp).then(() => {}, function(error) {
    echobad("Full JSON: " + JSON.stringify(error));
    walkError(error, "");
  });
};
