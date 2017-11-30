// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const ErrorTree = function(inputError) {
  const errorTree = {};

  errorTree.getLines = function() {
    const result = [inputError.description + ":"];

    for (const message of inputError.messages)
      result.push("  " + message);

    for (const error of inputError.children)
      for (const line of ErrorTree(error).getLines())
        result.push(line);

    return result;
  };

  errorTree.getJSON = function() {
    return JSON.stringify(inputError, fillInErrors, 0);
  };

  return errorTree;
};

module.exports = ErrorTree;

const fillInErrors = function(key, value) {
  if (value instanceof Error && JSON.stringify(value) === "{}")
    return value.toString();

  else
    return value;
};
