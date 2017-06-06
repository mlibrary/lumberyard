// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  var numerator = 0;
  var log_tree = { };

  log_tree.description = "";
  log_tree.num = () => numerator;
  log_tree.den = () => 1;

  log_tree.complete = function() {};

  log_tree[Symbol.iterator] = function*() {};

  return log_tree;
};
