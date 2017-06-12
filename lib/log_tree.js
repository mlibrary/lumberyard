// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

var tree_factory, parse_all_children, sum_denominators, children_of,
  log_message;

tree_factory = function(input_object) {
  var tree, denominator, children, is_complete;

  tree = { };

  is_complete = false;
  children = parse_all_children(input_object);
  denominator = 1 + sum_denominators(children);

  tree.length = children.length;
  tree.description = input_object.d || "";

  tree.num = function() {
    var result = is_complete ? 1 : 0;

    for (let child of children)
      result += child.num();

    return result;
  };

  tree.den = function() { return denominator; };

  tree.complete = function(input_array) {
    var message = log_message(input_array);
    tree.mark_true(message.address);
  };

  tree.mark_true = function(array) {
    if (array.length == 0)
      is_complete = true;

    else
      children[array.shift()].mark_true(array);
  };

  tree[Symbol.iterator] = function() {
    return children[Symbol.iterator]();
  };

  return tree;
};

parse_all_children = function(input_object) {
  var list_of_children = [ ];

  for (let child of children_of(input_object))
    list_of_children.push(tree_factory(child));

  return list_of_children;
};

children_of = function*(input_object) {
  if (input_object.hasOwnProperty("c"))
    yield* input_object.c;
};

sum_denominators = function(list_of_trees) {
  return list_of_trees.reduce(
    (sum, tree) => sum + tree.den(), 0);
};

log_message = function(input_array) {
  var array, result;

  array = [...input_array];
  result = {
    get address() { return [...array];}
  };

  result.timestamp = array.shift();
  result.code = array.shift();
  result.message = array.pop();

  return result;
};

module.exports = tree_factory;
