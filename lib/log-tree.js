// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeFactory, parseAllChildren, sumDenominators, childrenOf,
  logMessage;

treeFactory = function(inputObject) {
  let tree, denominator, children, isComplete;

  tree = { };

  isComplete = false;
  children = parseAllChildren(inputObject);
  denominator = 1 + sumDenominators(children);

  tree.length = children.length;
  tree.description = inputObject.d || "";

  tree.num = function() {
    let result = isComplete ? 1 : 0;

    for (let child of children)
      result += child.num();

    return result;
  };

  tree.den = function() { return denominator; };

  tree.complete = function(inputArray) {
    let message = logMessage(inputArray);
    return tree.markTrue(message, message.address);
  };

  tree.markTrue = function(message, addressPath) {
    if (addressPath.length === 0) {
      switch(message.code) {
        case "done":
          isComplete = true;

          if (tree.description === "")
            return "Finished ...";
          else
            return "Finished " + tree.description + " ...";

        case "begin":
          if (tree.description === "")
            return "Started ...";
          else
            return "Started " + tree.description + " ...";

        default:
          return message.message;
      }

    } else {
      return children[addressPath.shift()].markTrue(message,
                                                    addressPath);
    }
  };

  tree[Symbol.iterator] = function() {
    return children[Symbol.iterator]();
  };

  return tree;
};

parseAllChildren = function(inputObject) {
  let listOfChildren = [ ];

  for (let child of childrenOf(inputObject))
    listOfChildren.push(treeFactory(child));

  return listOfChildren;
};

childrenOf = function*(inputObject) {
  if (inputObject.hasOwnProperty("c"))
    yield* inputObject.c;
};

sumDenominators = function(listOfTrees) {
  return listOfTrees.reduce(
    (sum, tree) => sum + tree.den(), 0);
};

logMessage = function(inputArray) {
  let addressPath, result;

  addressPath = [...inputArray];
  result = {
    get address() { return [...addressPath];}
  };

  result.timestamp = addressPath.shift();
  result.code = addressPath.shift();
  result.message = addressPath.pop();

  return result;
};

module.exports = treeFactory;
