// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = {
  "ProcessTree": function({log = console.log} = {}) {
    return function() {
      log(bullet.green("Beginning setup and validation ..."));
      log(bullet.green("Finished setup and validation (0/1) ..."));
      log(bullet.green("Finished just the one (1/1) ..."));
      log(0);
    };
  }
};

const prependBullet = color => message =>
  "\x1b[" + color + "m *\x1b[0m " + message;

const bullet = {
  "green": prependBullet("1;32"),
  "yellow": prependBullet("1;33"),
  "red": prependBullet("1;31")
};
