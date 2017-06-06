// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const log_tree = require("../lib/log_tree");
var tree;

describe("a log_tree with no description and no children", function() {
  beforeEach(function() {
    tree = log_tree({});
  });

  it("has a description of ''", function() {
    expect(tree.description).toBe("");
  });

  it("has a denominator of 1", function() {
    expect(tree.den()).toBe(1);
  });

  it("has a numerator of 0", function() {
    expect(tree.num()).toBe(0);
  });

  it("expands into an empty array", function() {
    expect([...tree]).toEqual([]);
  });

  describe("when told that [] is complete", function() {
    beforeEach(function() {
      tree.complete('[1496756029, true, "it finished"]');
    });

    it("has a numerator of 1", function() {
      expect(tree.num()).toBe(1);
    });
  });
});

describe("a log_tree with two children", function() {
  beforeEach(function() {
    tree = log_tree({c:[{}, {}]});
  });

  it("has a denominator of 3", function() {
    expect(tree.den()).toBe(3);
  });

  it("expands into a two-item array", function() {
    expect([...tree].length).toBe(2);
  });
});

describe("a log_tree with two children and a grandchild", function() {
  beforeEach(function() {
    tree = log_tree({c:[{}, {c:[{}]}]});
  });

  it("has a denominator of 4", function() {
    expect(tree.den()).toBe(4);
  });

  it("expands into a two-item array", function() {
    expect([...tree].length).toBe(2);
  });

  it("can reach its grandchild", function() {
    expect([...[...tree][1]].length).toBe(1);
  });
});
