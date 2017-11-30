// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const LogTree = require("./log-tree");
const ProcessTree = require("./process-tree");

module.exports = {
  "ProcessTree": function({log = console.log} = {}) {
    const listener = Listener(log);
    const newLogger = LoggerFactory(listener);

    return function(callback) {
      log(bullet.green("Beginning setup and validation ..."));
      return new Promise(function(resolve, reject) {
        ProcessTree(newLogger, callback).then(logger => {
          logger.promise.then(() => {
            log(bullet.green("Done."));
            resolve();
          }, reject);
        }, error => {
          listener([Date.now(), "fatal", error]);
          resolve();
        });
      });
    };
  }
};

const LoggerFactory = logFunction => function(inputTree) {
  const logger = {};

  logger.log = logFunction;

  logger.storeProcess = function(promise) {
    logger.promise = promise.catch(error => {
      logger.log([Date.now(), "fatal", error]);
    });
  };

  logger.log([Date.now(), "log-tree", inputTree]);

  return logger;
};

const Listener = function(logFunction) {
  const internal = {};

  return function(message) {
    if (message[1] === "log-tree") {
      internal.logTree = LogTree(message[2]);
      logFunction(bullet.green("Finished setup and validation "
        + ratio(internal.logTree) + " ..."));
    } else if (message[1] === "fatal") {
      logFunction(bullet.red("Full JSON: {"));
    } else {
      const line = getLogLine(internal.logTree, message);

      if (line !== null)
        logFunction(line);
    }
  };
};

const getLogLine = (tree, message) => {
  const text = tree.complete(message);

  switch (message[1]) {
  case "begin":
    return null;

  case "done":
    return bullet.green(text + " " + ratio(tree) + " ...");

  case "info":
    return bullet.green(text);

  case "warn":
    return bullet.yellow(text);

  case "error":
    return bullet.red(text);

  default:
    return null;
  }
};

const ratio = tree => "(" + tree.num() + "/" + tree.den() + ")";

const prependBullet = color => message =>
  "\x1b[" + color + "m *\x1b[0m " + message;

const bullet = {
  "green": prependBullet("1;32"),
  "yellow": prependBullet("1;33"),
  "red": prependBullet("1;31")
};
