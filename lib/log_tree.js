// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(object) {
  var denominator = 1;
  var numerator = 0;

  var log_tree = { };

  if (object.hasOwnProperty("c"))
    denominator += object.c.length;

  log_tree.description = "";
  log_tree.num = () => numerator;
  log_tree.den = () => denominator;

  log_tree.complete = function() {
    numerator = 1;
  };

  log_tree[Symbol.iterator] = function*() {};

  return log_tree;
};
