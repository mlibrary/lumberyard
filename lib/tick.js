// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = n => new Promise(resolve => {
  if (typeof n === "undefined")
    n = 1;

  setTimeout(resolve, n*1000);
});
