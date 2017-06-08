// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

var tree_factory, parse_all_children;

tree_factory = function(input_object) {
  var tree, denominator, children, is_complete;

  tree = { };

  denominator = 1;
  children = parse_all_children(input_object);
  is_complete = false;

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

parse_all_children = function(input_object) {
  var list_of_children = [ ];

  if (input_object.hasOwnProperty("c")) {
    for (let child of input_object.c) {
      list_of_children.push(tree_factory(child));
    }
  }

  return list_of_children;
}

module.exports = tree_factory;
