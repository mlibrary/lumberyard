// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = {
  "ProcessTree": function({log = console.log} = {}) {
    return function() {
      log(bullet.green("Beginning setup and validation ..."));
      for (let i = 0; i < 3; i += 1)
        log(i);
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
