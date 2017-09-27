// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const EventEmitter = require("events");

module.exports = function() {
  let internal = {};
  let fsMock = {};

  fsMock.stat = function(filename, callback) {
    if (internal.isValid(filename)) {
      let file = internal.get(filename);

      callback(undefined, {
        "size": file.length,

        "isDirectory": () => {
          return file instanceof Map;
        }
      });
    }

    else
      callback("error");
  };

  fsMock.readdir = fsMock.stat;

  fsMock.createReadStream = function(filename) {
    let stream = new EventEmitter();

    setTimeout(function() {
      if (internal.isValid(filename)) {
        stream.emit("data", internal.getFileData(filename));
        stream.emit("end");
      }

      else
        stream.emit("error");
    }, 30);

    return stream;
  };

  fsMock.set = function(filename, content) {
    let split = internal.split(filename);
    split.map.set(split.name, content);
  };

  fsMock.delete = function(filename) {
    internal.files.delete(filename);
  };

  fsMock.mkdir = function(filename) {
    let split = internal.split(filename);
    split.map.set(split.name, new Map());
  };

  internal.files = new Map();

  internal.isValid = function(filename) {
    let directories = filename.split("/");
    let localFilename = directories.pop();
    let fileMap = internal.files;

    for (let directory of directories) {
      fileMap = fileMap.get(directory);

      if (! fileMap instanceof Map)
        return false;
    }

    return fileMap.has(localFilename);
  };

  internal.getFileData = function(filename) {
    return internal.files.get(filename);
  };

  internal.split = function(filename) {
    let directories = filename.split("/");
    let localFilename = directories.pop();
    let fileMap = internal.files;

    for (let directory of directories) {
      fileMap = fileMap.get(directory);

      if (! fileMap instanceof Map)
        throw "not a directory: " + directory;
    }

    if (fileMap.get(localFilename) instanceof Map)
      throw "cannot overwrite directory: " + filename;

    return {
      "map": fileMap,
      "name": localFilename
    };
  };

  internal.get = function(path) {
    let directories = path.split("/");
    let localFilename = directories.pop();
    let fileMap = internal.files;

    for (let directory of directories) {
      fileMap = fileMap.get(directory);

      if (! fileMap instanceof Map)
        throw "not a directory: " + directory;
    }

    return fileMap.get(localFilename);
  };

  return fsMock;
};
