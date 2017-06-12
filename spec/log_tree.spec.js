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

  it("has a length of 0", () => {
    expect(tree.length).toBe(0);
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

  it("has a length of 2", () => {
    expect(tree.length).toBe(2);
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

  it("has a length of 2", () => {
    expect(tree.length).toBe(2);
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

describe("a complicated log_tree with great-grandchildren", () => {
  beforeEach(() => {
    // More visually:
    //
    //     process_dir/
    //     |-- Shipment_2017123/
    //     |   |-- 39015012345677/
    //     |   |   |-- 00000001.tif
    //     |   |   |-- 00000002.tif
    //     |   |   |-- 00000003.tif
    //     |   |   |-- 00000004.tif
    //     |   |   \-- 00000005.tif
    //     |   \-- 39015012345685/
    //     |       |-- 00000001.tif
    //     |       |-- 00000002.tif
    //     |       \-- 00000003.tif
    //     \-- Shipment_2017124/
    //         |-- 39015012345693/
    //         |   |-- 00000001.tif
    //         |   |-- 00000002.tif
    //         |   |-- 00000003.tif
    //         |   \-- 00000004.tif
    //         \-- 39015012345701/
    //             \-- 00000001.tif
    tree = log_tree({
      c: [{
        d:"Shipment_2017123",
        c: [{
          d:"39015012345677",
          c: [
            {d:"00000001.tif"},
            {d:"00000002.tif"},
            {d:"00000003.tif"},
            {d:"00000004.tif"},
            {d:"00000005.tif"}
          ]
        },{
          d:"39015012345685",
          c: [
            {d:"00000001.tif"},
            {d:"00000002.tif"},
            {d:"00000003.tif"}
          ]
        }]
      },{
        d:"Shipment_2017124",
        c: [{
          d:"39015012345693",
          c: [
            {d:"00000001.tif"},
            {d:"00000002.tif"},
            {d:"00000003.tif"},
            {d:"00000004.tif"}
          ]
        },{
          d:"39015012345701",
          c: [
            {d:"00000001.tif"}
          ]
        }]
      }]
    });
  });

  it("has a denominator of 20", () => {
    expect(tree.den()).toBe(20);
  });

  it("has a length of 2", () => {
    expect(tree.length).toBe(2);
  });
});
