// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fs = require("fs");
const makePromise = require("./make-promise");

const appendFile = makePromise(fs.appendFile);
const stat = makePromise(fs.stat);

module.exports = function(filename, jsonProcessor, debug = false) {
  const debugTools = {};
  const run = () => new Promise(function(resolve, reject) {
    stat(filename).catch(() => {
      return appendFile(filename, "");
    }).then(() => {
      const rejectGracefully = function(error) {
        watcher.close();
        reject(error);
      };

      const listener = function(jsonObject) {
        const result = jsonProcessor(jsonObject);

        if (typeof result !== "undefined") {
          watcher.close();
          tracker.then(() => {
            resolve(result);
          }, reject);
        }
      };

      const tracker = FileTracker(filename, listener);
      debugTools.tryToRead = () => {
        tracker.read();
        tracker.catch(rejectGracefully);
      };

      const watcher = fs.watch(filename, debugTools.tryToRead);

      debugTools.tryToRead();
    }, reject);
  });

  if (debug) {
    debugTools.proc = run();
    return debugTools;
  } else {
    return run();
  }
};

const FileTracker = function(filename, jsonProcessor) {
  const internal = {};
  const tracker = {};

  internal.data = "";
  internal.offset = 0;
  internal.alreadyChanged = false;
  internal.inProcess = false;
  internal.currentProcess = Promise.resolve();

  internal.read = function() {
    return new Promise(function(resolve, reject) {
      internal.alreadyChanged = false;
      stat(filename).then(stats => {
        if (stats.size < internal.offset)
          reject(Error("Expected appends, not rewrites: " + filename));

        else if (stats.size === internal.offset)
          internal.finish(resolve, reject);

        else
          internal.readSegment(resolve, reject, stats.size);
      }, reject);
    });
  };

  internal.readSegment = function(resolve, reject, size) {
    const readStream = fs.createReadStream(
      filename, {start: internal.offset, end: size - 1});

    readStream.on("error", reject);

    readStream.on("data", chunk => {
      const lines = (internal.data + chunk.toString()).split("\n");
      internal.data = lines.pop();

      for (const line of lines)
        jsonProcessor(JSON.parse(line));
    });

    readStream.on("end", () => {
      internal.offset = size;

      internal.finish(resolve, reject);
    });
  };

  internal.finish = function(resolve, reject) {
    if (internal.alreadyChanged)
      internal.read().then(resolve, reject);

    else
      resolve();
  };

  tracker.then = function(x, y) {
    internal.currentProcess.then(x, y);
  };

  tracker.catch = function(x) {
    internal.currentProcess.catch(x);
  };

  tracker.read = function() {
    if (internal.inProcess) {
      internal.alreadyChanged = true;
    } else {
      internal.inProcess = true;
      internal.currentProcess = internal.read().then(() => {
        internal.inProcess = false;
      });
    }
  };

  return tracker;
};
