// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const EventEmitter = require("events");

module.exports = function() {
  let internal = {};
  let fsMock = {};

  fsMock.stat = function(filename, callback) {
    if (internal.isValid(filename))
      callback(undefined, 0);

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
    internal.files.set(filename, content);
  };

  fsMock.delete = function(filename) {
    internal.files.delete(filename);
  };

  internal.files = new Map();

  internal.isValid = function(filename) {
    return (internal.files.has(filename));
  };

  internal.getFileData = function(filename) {
    return internal.files.get(filename);
  };

  return fsMock;
};
