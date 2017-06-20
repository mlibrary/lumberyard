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

let getMessageText = message => message[message.length - 1];

let stdoutLogger = function(inputTree) {
  let logger = {};
  let tree = logTree(inputTree);

  let say = function(message) {
    echogood("Finished " + message + " ("
      + tree.num().toString() + "/"
      + tree.den().toString() + ") ...");
  };

  say("setup and validation");

  logger.log = function(message) {
    let description = tree.complete(message);

    switch(message[1]) {
      case "done":
        say(description);
        break;

      case "info":
        echogood(getMessageText(message));
        break;

      case "warn":
        echowarn(getMessageText(message));
        break;

      case "error":
        echobad(getMessageText(message));
        break;
    }
  };

  logger.storeProcess = function(promise) {
    logger.promise = promise;
    logger.promise.then(function(value) { echogood("Done."); });
  };

  return logger;
};

module.exports = function(setUp) {
  echogood("Beginning setup and validation ...");
  return processTree(stdoutLogger, setUp);
};
