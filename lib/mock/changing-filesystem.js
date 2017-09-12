// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  let fsMock = {};

  fsMock.stat = (filename, callback) => {
    callback("error");
  };

  fsMock.readdir = fsMock.stat;

  fsMock.createReadStream = () => {
    return {"on": fsMock.stat};
  };

  return fsMock;
};
