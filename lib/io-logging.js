// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");
const makePromise = require("./make-promise");
const JsonlFollower = require("./jsonl-follower");
const LogTree = require("./log-tree");
const ProcessTree = require("./process-tree");
const ErrorTree = require("./error-tree");

const append = makePromise(fs.appendFile);

module.exports = function({log = console.log} = {}) {
  return function(file, callback) {
    if (typeof callback === "undefined") {
      if (typeof file === "function") {
        const listener = Listener(log);
        const newLogger = LoggerFactory(listener);

        callback = file;
        log(bullet.green("Beginning setup and validation ..."));
        return new Promise(function(resolve) {
          const reject = error => {
            listener([Date.now(), "fatal", error]);
            resolve();
          };

          ProcessTree(newLogger, callback).then(logger => {
            logger.promise.then(() => {
              log(bullet.green("Done."));
              resolve();
            }, reject);
          }, reject);
        });
      } else {
        const listener = Listener(log, false);

        log(bullet.green("Beginning setup and validation ..."));
        return new Promise(function(resolve, reject) {
          JsonlFollower(file, o => {
            listener(o);

            if (o[1] === "done" && o.length === 3) {
              log(bullet.green("Done."));
              return true;
            } else if (o[1] === "fatal") {
              return Error(o[2]);
            }
          }).then(result => {
            if (result === true)
              resolve();

            else
              reject(result);
          }, reject);
        });
      }
    } else {
      const logToFile = FileLog(file);
      const fileLogger = LoggerFactory(logToFile.fn);

      const tree = new Promise(function(resolve) {
        const reject = error => {
          logToFile.fn([Date.now(), "fatal", error]);
          resolve();
        };

        ProcessTree(fileLogger, callback).then(logger => {
          logger.promise.then(resolve, reject);
        }, reject);
      });

      return tree.then(() => {
        return logToFile.promise;
      });
    }
  };
};

const FileLog = function(file) {
  const logToFile = {};

  logToFile.promise = Promise.resolve();

  logToFile.fn = function(x) {
    logToFile.promise = logToFile.promise.then(() => {
      return append(file, JSON.stringify(x, fillInErrors, 0) + "\n");
    });
  };

  return logToFile;
};

const LoggerFactory = logFunction => function(inputTree) {
  const logger = {};

  logger.log = logFunction;

  logger.storeProcess = function(promise) {
    logger.promise = promise;
  };

  logger.log([Date.now(), "log-tree", inputTree]);

  return logger;
};

const Listener = function(logFunction, printFullJson = true) {
  const internal = {};

  return function(message) {
    if (message[1] === "log-tree") {
      internal.logTree = LogTree(message[2]);
      logFunction(bullet.green("Finished setup and validation "
        + ratio(internal.logTree) + " ..."));
    } else if (message[1] === "fatal") {
      const error = ErrorTree(message[2]);

      if (printFullJson)
        logFunction(bullet.red("Full JSON: " + error.getJSON()));

      for (const line of error.getLines())
        logFunction(bullet.red(line));
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

const fillInErrors = function(key, value) {
  if (value instanceof Error && JSON.stringify(value) === "{}")
    return value.toString();

  else
    return value;
};
