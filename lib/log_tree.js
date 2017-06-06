// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  log_tree = { };

  log_tree.description = "";
  log_tree.num = () => 0;
  log_tree.den = () => 1;

  log_tree[Symbol.iterator] = function*() {};

  return log_tree;
};
