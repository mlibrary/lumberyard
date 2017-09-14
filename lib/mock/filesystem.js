// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const EventEmitter = require("events");

module.exports = function() {
  let internal = {};
  let fsMock = {};

  fsMock.stat = (filename, callback) => {
    if (filename === internal.statable)
      callback();

    else
      callback("error");
  };

  fsMock.readdir = fsMock.stat;

  fsMock.createReadStream = () => {
    let stream = new EventEmitter();

    setTimeout(function() {
      stream.emit("error");
    }, 30);

    return stream;
  };

  fsMock.set = function(filename, content) {
    internal.statable = filename;
  };

  return fsMock;
};
