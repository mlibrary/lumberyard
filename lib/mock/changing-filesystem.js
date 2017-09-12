// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const EventEmitter = require("events");

module.exports = function() {
  let fsMock = {};

  fsMock.stat = (filename, callback) => {
    callback("error");
  };

  fsMock.readdir = fsMock.stat;

  fsMock.createReadStream = () => {
    let stream = new EventEmitter();

    setTimeout(function() {
      stream.emit("error");
    }, 50);

    return stream;
  };

  return fsMock;
};
