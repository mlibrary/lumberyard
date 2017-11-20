// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = {
  "ProcessTree": function({log = console.log}) {
    return function() {
      for (let i = 0; i < 4; i += 1)
        log(i);
    };
  }
};
