// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const log_tree = require("../lib/log_tree");

describe("a log_tree object", function() {
  var tree;

  describe("when created from nothing", function() {
    beforeEach(function() {
      tree = log_tree();
    });

    it("has a length of 0", function() {
      expect(tree.length).toBe(0);
    });

    it("has a name of ''", function() {
      expect(tree.name).toBe("");
    });

    it("remembers a name change", function() {
      tree.name = "matt";
      expect(tree.name).toBe("matt");
    });

    it("doesn't remember a length change", function() {
      tree.length = 1;
      expect(tree.length).toBe(0);
    });
  });

  describe("when created with a name", function() {
    beforeEach(function() {
      tree = log_tree("name");
    });

    it("remembers its name", function() {
      expect(tree.name).toBe("name");
    });
  });
});
