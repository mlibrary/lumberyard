// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  const errorTree = {};

  errorTree.getLines = function() {
    return ["one node:", "  uh oh"];
  };

  errorTree.getJSON = function() {
    return JSON.stringify({
      "description": "one node",
      "messages": ["uh oh"],
      "children": []
    });
  };

  return errorTree;
};
