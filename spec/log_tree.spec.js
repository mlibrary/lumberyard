// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const log_tree = require("../lib/log_tree");
var tree;

describe("a log_tree with no description and no children", () => {
  beforeEach(() => {
    tree = log_tree({});
  });

  it("has a description of ''", () => {
    expect(tree.description).toBe("");
  });

  it("has a denominator of 1", () => {
    expect(tree.den()).toBe(1);
  });

  it("has a numerator of 0", () => {
    expect(tree.num()).toBe(0);
  });

  it("expands into an empty array", () => {
    expect([...tree]).toEqual([]);
  });

  describe("when told that [] is complete", () => {
    beforeEach(() => {
      tree.complete('[1496756029, "done", "it finished"]');
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).toBe(1);
    });
  });
});

describe("a log_tree with two children", () => {
  beforeEach(() => {
    tree = log_tree({c:[{}, {}]});
  });

  it("has a denominator of 3", () => {
    expect(tree.den()).toBe(3);
  });

  it("expands into a two-item array", () => {
    expect([...tree].length).toBe(2);
  });
});

describe("a log_tree with two children and a grandchild", () => {
  beforeEach(() => {
    tree = log_tree({c:[{}, {c:[{}]}]});
  });

  it("has a denominator of 4", () => {
    expect(tree.den()).toBe(4);
  });

  it("expands into a two-item array", () => {
    expect([...tree].length).toBe(2);
  });

  it("can reach its grandchild", () => {
    expect([...[...tree][1]].length).toBe(1);
  });

  it("has a numerator of 0", () => {
    expect(tree.num()).toBe(0);
  });

  describe("when told that [0] is complete", () => {
    var children;

    beforeEach(() => {
      tree.complete('[1496756029, "done", 0, "it finished"]');
      children = [...tree];
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).toBe(1);
    });

    it("has a first child with a numerator of 1", () => {
      expect(children[0].num()).toBe(1);
    });
  });
});

describe("a log_tree with a description and no children", () => {
  beforeEach(() => {
    tree = log_tree({d:"specification process"});
  });

  it("stores its description", () => {
    expect(tree.description).toBe("specification process");
  });
});
