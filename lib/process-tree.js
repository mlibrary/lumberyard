// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = (logger) => new Promise((resolve, reject) => {
  let tree = { };

  tree.logger = logger();

  resolve(tree);
});
