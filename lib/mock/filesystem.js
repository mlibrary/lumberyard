// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const EventEmitter = require("events");

module.exports = function() {
  let internal = {};
  let fsMock = {};

  fsMock.stat = (filename, callback) => new Promise(function(resolve) {
    if (internal.isValid(filename)) {
      let file = internal.get(filename);

      resolve(callback(undefined, {
        "size": file.length,

        "isDirectory": () => {
          return file instanceof Map;
        }
      }));
    }

    else
      resolve(callback("error"));
  });

  fsMock.readdir = (dirname, callback) => new Promise(function(resolve) {
    if (internal.isValid(dirname)) {
      let dir = internal.get(dirname);

      if (dir instanceof Map)
        resolve(callback(undefined, [...dir.keys()]));

      else
        resolve(callback("error"));
    }

    else
      resolve(callback("error"));
  });

  fsMock.createReadStream = function(filename) {
    let stream = new EventEmitter();

    setTimeout(function() {
      if (internal.isValid(filename)) {
        let data = internal.get(filename);

        if (data instanceof Map)
          stream.emit("error");

        else {
          stream.emit("data", data);
          stream.emit("end");
        }
      }

      else
        stream.emit("error");
    }, 30);

    return stream;
  };

  fsMock.set = function(filename, content) {
    let split = internal.split(filename);
    split.assertNotDir();
    split.map.set(split.name, content);
  };

  fsMock.delete = function(filename) {
    internal.files.delete(filename);
  };

  fsMock.mkdir = function(filename) {
    let split = internal.split(filename);
    split.assertNotDir();
    split.map.set(split.name, new Map());
  };

  internal.files = new Map();

  internal.isValid = function(filename) {
    let split = internal.split(filename);
    return split.map.has(split.name);
  };

  internal.get = function(filename) {
    let split = internal.split(filename);
    return split.map.get(split.name);
  };

  internal.split = function(filename) {
    let directories = filename.split("/");
    let localFilename = directories.pop();
    let fileMap = internal.files;

    for (let directory of directories) {
      fileMap = fileMap.get(directory);

      // shouldn't have written this yet, never tripped by tests
      if (! fileMap instanceof Map)
        throw "not a directory: " + directory;
    }

    return {
      "map": fileMap,
      "name": localFilename,
      "assertNotDir": function() {
        if (fileMap.get(localFilename) instanceof Map)
          throw "directory already here: " + filename;
      }
    };
  };

  return fsMock;
};
