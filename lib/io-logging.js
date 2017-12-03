// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-disable no-unused-vars */
/* eslint-disable promise/param-names */
const fs = require("fs");
const makePromise = require("./make-promise");
const LogTree = require("./log-tree");
const ProcessTree = require("./process-tree");
const ErrorTree = require("./error-tree");

const append = makePromise(fs.appendFile);
const stat = makePromise(fs.stat);

const FileFollower = logFunction => file => {
  return new Promise(function(resolve, reject) {

  });
};

const ff = function(eachLineCallback) {
  const internal = {};
  const obj = {};

  internal.data = "";
  internal.offset = 0;
  internal.checkAgain = false;
  internal.inProcess = false;

  internal.done = function(filename) {
    internal.inProcess = false;

    if (internal.checkAgain)
      obj.checkFile(filename);
  };

  obj.checkFile = function(filename) {
    if (internal.inProcess) {
      internal.checkAgain = true;
    } else {
      internal.inProcess = true;
      internal.checkAgain = false;

      fs.stat(filename, (error, stats) => {
        if (error)
          throw error;
        if (stats.size < internal.offset)
          throw Error("File got shorter: " + filename);

        if (stats.size > internal.offset) {
          const readStream = fs.createReadStream(
            filename, {start: internal.offset, end: stats.size});

          readStream.on("data", chunk => {
            const data = chunk.toString();
            const lines = (internal.data + data).split("\n");

            internal.data = lines.pop();
            internal.offset = stats.size();

            for (const line of lines)
              eachLineCallback(JSON.parse(line));
          });

          readStream.on("error", error => {
            throw error;
          });

          readStream.on("end", () => {
            internal.done(filename);
          });
        } else {
          internal.done(filename);
        }
      });
    }
  };

  return obj;
};

const f = function(file, listener) {
  return stat(file).catch(() => {
    return append(file, "");
  }).then(() => new Promise(function(resolve, reject) {
    const freader = ff(function(obj) {
      listener(obj);

      if (obj[1] === "fatal") {
        watcher.close();
        reject(Error());
      } else if (obj[1] === "done" && obj.length === 3) {
        watcher.close();
        resolve();
      }
    });

    const watcher = fs.watch(file, (eventType, filename) => {
    });
  }), error => {
    throw error;
  });
};

module.exports = {
  "ProcessTree": function({log = console.log} = {}) {
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
          const newLogger = LoggerFactory(listener);

          log(bullet.green("Beginning setup and validation ..."));
          return new Promise(function(resolve, reject) {
            stat(file).catch(() => {
              return append(file, "");
            }).then(() => {
              let data = "";
              let pos = 0;
              let queue = Promise.resolve();

              const watcher = fs.watch(file, (eventType, filename) => {
                if (eventType === "change")
                  queue = queue.then(() => {
                    return stat(file);
                  }, reject).then(stats => new Promise(yay => {
                    if (stats.size > pos) {
                      const readStream = fs.createReadStream(
                        file, {start: pos, end: stats.size});

                      readStream.on("data", chunk => {
                        const s = chunk.toString();
                        const lines = (data + s).split("\n");

                        data = lines.pop();
                        pos += s.length;

                        for (const line of lines) {
                          const o = JSON.parse(line);
                          listener(JSON.parse(line));

                          if (o[1] === "fatal") {
                            watcher.close();
                            reject(Error());
                          } else if (o[1] === "done" && o.length === 3) {
                            watcher.close();
                            log(bullet.green("Done."));
                            resolve();
                          }
                        }
                      });

                      readStream.on("error", error => {
                        reject(error);
                      });

                      readStream.on("end", yay);
                    } else {
                      pos = stats.size;
                      yay();
                    }
                  }), reject);
              });
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
  }
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
