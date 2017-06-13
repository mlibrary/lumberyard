// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const logTree = require("../lib/log-tree");
let tree;

describe("a logTree with no description and no children", () => {
  beforeEach(() => {
    tree = logTree({});
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
      tree.complete([1496756029, "done", "it finished"]);
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).toBe(1);
    });
  });
});

describe("a logTree with two children", () => {
  beforeEach(() => {
    tree = logTree({c:[{}, {}]});
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

describe("a logTree with two children and a grandchild", () => {
  beforeEach(() => {
    tree = logTree({c:[{}, {c:[{}]}]});
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
    let children;

    beforeEach(() => {
      tree.complete([1496756029, "done", 0, "it finished"]);
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

describe("a logTree with a description and no children", () => {
  beforeEach(() => {
    tree = logTree({d:"specification process"});
  });

  it("stores its description", () => {
    expect(tree.description).toBe("specification process");
  });
});

describe("a complicated logTree with great-grandchildren", () => {
  beforeEach(() => {
    // process_dir/
    // |-- Shipment_2017123/
    // |   |-- 39015012345677/
    // |   |   |-- 00000001.tif
    // |   |   |-- 00000002.tif
    // |   |   |-- 00000003.tif
    // |   |   |-- 00000004.tif
    // |   |   \-- 00000005.tif
    // |   \-- 39015012345685/
    // |       |-- 00000001.tif
    // |       |-- 00000002.tif
    // |       \-- 00000003.tif
    // \-- Shipment_2017124/
    //     |-- 39015012345693/
    //     |   |-- 00000001.tif
    //     |   |-- 00000002.tif
    //     |   |-- 00000003.tif
    //     |   \-- 00000004.tif
    //     \-- 39015012345701/
    //         \-- 00000001.tif
    tree = logTree({
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

  it("starts with a numerator of 0", () => {
    expect(tree.num()).toBe(0);
  });

  it("has no description", () => {
    expect(tree.description).toBe("");
  });

  describe("the tree's first child", () => {
    let child;

    beforeEach(() => {
      child = [...tree][0];
    });

    it("has a description of Shipment_2017123", () => {
      expect(child.description).toBe("Shipment_2017123");
    });

    it("has a denominator of 11", () => {
      expect(child.den()).toBe(11);
    });
  });

  describe("when starting the first page", () => {
    beforeEach(() => {
      tree.complete([5000, "begin", "starting process"]);
      tree.complete([5000, "begin", 0, "starting shipment"]);
      tree.complete([5000, "begin", 0, 0, "starting volume"]);
      tree.complete([5000, "begin", 0, 0, 0, "starting page"]);
    });

    it("still has a numerator of 0", () => {
      expect(tree.num()).toBe(0);
    });
  });

  describe("when completing the first page of the first volume", () => {
    beforeEach(() => {
      tree.complete([12345, "done", 0, 0, 0, "first page done"]);
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).toBe(1);
    });
  });
});
