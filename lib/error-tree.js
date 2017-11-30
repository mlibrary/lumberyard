// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(inputError) {
  const errorTree = {};

  errorTree.getLines = function() {
    return [
      inputError.description + ":",
      "  " + inputError.messages[0]
    ];
  };

  errorTree.getJSON = function() {
    return JSON.stringify(inputError, fillInErrors, 0);
  };

  return errorTree;
};

const fillInErrors = function(key, value) {
  if (value instanceof Error && JSON.stringify(value) === "{}")
    return value.toString();

  else
    return value;
};
