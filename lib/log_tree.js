// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

var factory = function(object) {
  var c;
  var denominator = 1;
  var numerator = 0;
  var children = [ ];
  var is_complete = false;

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
  log_tree.num = function() {
    var result = is_complete ? 1 : 0;
    for (let x of children) {
      result += x.num();
    }

    return result;
  };
  log_tree.den = function() { return denominator; };

  log_tree.complete = function(json_string) {
    var array, timestamp, code, message;
    array = JSON.parse(json_string);
    timestamp = array.shift();
    code = array.shift();
    message = array.pop();
    log_tree.mark_true(array);
  };

  log_tree.mark_true = function(array) {
    var i;

    if (array.length == 0) {
      is_complete = true;
    } else {
      i = array.shift();
      children[i].mark_true(array);
    }
  };

  log_tree[Symbol.iterator] = function() {
    return children[Symbol.iterator]();
  };

  return log_tree;
};

module.exports = factory;
