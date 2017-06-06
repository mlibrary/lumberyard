// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

var factory = function(object) {
  var denominator = 1;
  var numerator = 0;
  var children = [ ];

  var log_tree = { };

  if (object.hasOwnProperty("c")) {
    for (c of object.c) {
      children.push(factory(c));
    }
  }

  for (c of children) {
    denominator += c.den();
  }

  log_tree.description = "";
  log_tree.num = function() { return numerator; };
  log_tree.den = function() { return denominator; };

  log_tree.complete = function() {
    numerator = 1;
  };

  log_tree[Symbol.iterator] = function() {
    return children[Symbol.iterator]();
  };

  return log_tree;
};

module.exports = factory;
