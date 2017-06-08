// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

var factory = function(object) {
  var tree, denominator, children, is_complete;

  tree = { };

  denominator = 1;
  children = [ ];
  is_complete = false;

  if (object.hasOwnProperty("c")) {
    for (let c of object.c) {
      children.push(factory(c));
    }
  }

  for (let c of children) {
    denominator += c.den();
  }

  tree.description = "";
  tree.num = function() {
    var result = is_complete ? 1 : 0;
    for (let x of children) {
      result += x.num();
    }

    return result;
  };
  tree.den = function() { return denominator; };

  tree.complete = function(json_string) {
    var array, timestamp, code, message;
    array = JSON.parse(json_string);
    timestamp = array.shift();
    code = array.shift();
    message = array.pop();
    tree.mark_true(array);
  };

  tree.mark_true = function(array) {
    var i;

    if (array.length == 0) {
      is_complete = true;
    } else {
      i = array.shift();
      children[i].mark_true(array);
    }
  };

  tree[Symbol.iterator] = function() {
    return children[Symbol.iterator]();
  };

  return tree;
};

module.exports = factory;
