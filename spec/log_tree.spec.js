// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const log_tree = require("../lib/log_tree");

describe("a log_tree object", function() {
  it("can be created from nothing", function() {
    var tree = log_tree();
  });

  it("can be created with a name", function() {
    var tree = log_tree("name");
  });

  it("has a length of 0 when created from nothing", function() {
    var tree = log_tree();
    expect(tree.length()).toBe(0);
  });
});
