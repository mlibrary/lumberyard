// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const ProcessTree = require("./process-tree");
const LogTree = require("./log-tree");

let logTools = {};

logTools.GenericLoggerFactory = function(logFunction) {
  return function(inputTree) {
    logFunction([Date.now(), "valid", inputTree]);

    let logger = {};

    logger.log = logFunction;

    logger.storeProcess = function(promise) {
      logger.promise = promise;
      logger.promise.then(() => {}, error => {
        logger.log([Date.now(), "fatal", error]);
      });
    };

    return logger;
  };
};

logTools.GenericListenerFactory = logFunction => new Promise(
    function(resolveIntoPromise) {
  let internal = {};

  internal.methodAssigner = new Promise(function(methodsAssigned) {
    internal.processWatcher = new Promise(function(resolve, reject) {
      internal.log = function(message) {
        if (message[1] === "valid")
          internal.tree = LogTree(message[2]);

        else if (message[1] === "fatal")
          reject(message[2]);

        else {
          try {
            Promise.resolve(logFunction(internal.tree, message)).then(
                function() {
              if (internal.tree.num() >= internal.tree.den())
                resolve();
            }, reject);

          } catch (error) {
            reject(error);
          }
        }
      };

      methodsAssigned();
    });
  });

  internal.methodAssigner.then(function() {
    resolveIntoPromise({
      "promise": internal.processWatcher,
      "log": internal.log});
  });
});

let prependSpecificBullet = function(color) {
  return function(message) {
    return "\x1b[" + color + "m *\x1b[0m " + message;
  };
};

let prependBullet = {
  "green": prependSpecificBullet("1;32"),
  "yellow": prependSpecificBullet("1;33"),
  "red": prependSpecificBullet("1;31")
};

let logToStdOut = function(tree, message) {
  let text = tree.complete(message);

  let say = function(s) {
    console.log(prependBullet.green(s) + " ("
                + tree.num().toString() + "/"
                + tree.den().toString() + ") ...");
  };

  switch(message[1]) {
    case "begin":
      if (message.length === 3)
        say("Finished setup and validation");
      break;

    case "done":
      say(text);

      if (message.length === 3)
        console.log(prependBullet.green("Done."));

      break;

    case "info":
      console.log(prependBullet.green(text));
      break;

    case "warn":
      console.log(prependBullet.yellow(text));
      break;

    case "error":
      console.log(prependBullet.red(text));
      break;
  }
};

logTools.BulletedListener = function() {
  console.log(prependBullet.green(
    "Beginning setup and validation ..."));

  return logTools.GenericListenerFactory(logToStdOut);
};

logTools.walkErrorToStdOut = function(error, indent) {
  indent = indent || "";

  console.log(prependBullet.red(
    indent + (error.description || "") + ":"));

  for (let message of error.messages)
    console.log(prependBullet.red(indent + "  " + message));

  for (let child of error.children)
    logTools.walkErrorToStdOut(child, indent + "  ");
};

logTools.QuickProcess = setUp => new Promise(function(resolve, reject) {
  logTools.BulletedListener().then(function(listener) {
    let process = ProcessTree(
      logTools.GenericLoggerFactory(listener.log), setUp);

    Promise.all([listener.promise, process]).catch(error => {
      console.log(prependBullet.red("Full JSON: "
        + JSON.stringify(error)));
      logTools.walkErrorToStdOut(error);
    });
  });
});

module.exports = logTools;
