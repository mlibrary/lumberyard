// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const logTree = require("../../lib/log-tree");
let tree, description;

describe("a logTree with no description and no children", () => {
  beforeEach(() => {
    tree = logTree({});
  });

  it("has a description of ''", () => {
    expect(tree.description).to.equal("");
  });

  it("has a denominator of 1", () => {
    expect(tree.den()).to.equal(1);
  });

  it("has a numerator of 0", () => {
    expect(tree.num()).to.equal(0);
  });

  it("has a length of 0", () => {
    expect(tree.length).to.equal(0);
  });

  it("expands into an empty array", () => {
    expect([...tree]).to.deep.equal([]);
  });

  describe("when told that [] is complete", () => {
    beforeEach(() => {
      description = tree.complete([1496756029, "done", "it finished"]);
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).to.equal(1);
    });

    it("returns the empty description", () => {
      expect(description).to.equal("Finished");
    });
  });
});

describe("a logTree with two children", () => {
  beforeEach(() => {
    tree = logTree({"c": [{}, {}]});
  });

  it("has a denominator of 3", () => {
    expect(tree.den()).to.equal(3);
  });

  it("has a length of 2", () => {
    expect(tree.length).to.equal(2);
  });

  it("expands into a two-item array", () => {
    expect([...tree].length).to.equal(2);
  });
});

describe("a logTree with two children and a grandchild", () => {
  beforeEach(() => {
    tree = logTree({c: [{}, {c: [{}]}]});
  });

  it("has a denominator of 4", () => {
    expect(tree.den()).to.equal(4);
  });

  it("has a length of 2", () => {
    expect(tree.length).to.equal(2);
  });

  it("expands into a two-item array", () => {
    expect([...tree].length).to.equal(2);
  });

  it("can reach its grandchild", () => {
    expect([...[...tree][1]].length).to.equal(1);
  });

  it("has a numerator of 0", () => {
    expect(tree.num()).to.equal(0);
  });

  describe("when told that [0] is complete", () => {
    let children;

    beforeEach(() => {
      description = tree.complete(
        [1496756029, "done", 0, "it finished"]);
      children = [...tree];
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).to.equal(1);
    });

    it("has a first child with a numerator of 1", () => {
      expect(children[0].num()).to.equal(1);
    });

    it("returns an empty description", () => {
      expect(description).to.equal("Finished");
    });
  });
});

describe("a logTree with a description and no children", () => {
  beforeEach(() => {
    tree = logTree({d: "specification process"});
  });

  it("stores its description", () => {
    expect(tree.description).to.equal("specification process");
  });

  it("returns its description when completed", () => {
    expect(tree.complete([1234, "done", ""])).to.equal(
      "Finished specification process");
  });

  it("returns a 'started' message when started", () => {
    expect(tree.complete([1234, "begin", ""])).to.equal(
      "Started specification process");
  });

  it("returns 'info' messages as written", () => {
    expect(tree.complete([1234, "info", "wow very informative"])).to.equal(
      "wow very informative");
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
        d: "Shipment_2017123",
        c: [{
          d: "39015012345677",
          c: [
            {d: "00000001.tif"},
            {d: "00000002.tif"},
            {d: "00000003.tif"},
            {d: "00000004.tif"},
            {d: "00000005.tif"}
          ]
        }, {
          d: "39015012345685",
          c: [
            {d: "00000001.tif"},
            {d: "00000002.tif"},
            {d: "00000003.tif"}
          ]
        }]
      }, {
        d: "Shipment_2017124",
        c: [{
          d: "39015012345693",
          c: [
            {d: "00000001.tif"},
            {d: "00000002.tif"},
            {d: "00000003.tif"},
            {d: "00000004.tif"}
          ]
        }, {
          d: "39015012345701",
          c: [
            {d: "00000001.tif"}
          ]
        }]
      }]
    });
  });

  it("has a denominator of 20", () => {
    expect(tree.den()).to.equal(20);
  });

  it("has a length of 2", () => {
    expect(tree.length).to.equal(2);
  });

  it("starts with a numerator of 0", () => {
    expect(tree.num()).to.equal(0);
  });

  it("has no description", () => {
    expect(tree.description).to.equal("");
  });

  describe("the tree's first child", () => {
    let child;

    beforeEach(() => {
      child = [...tree][0];
    });

    it("has a description of Shipment_2017123", () => {
      expect(child.description).to.equal("Shipment_2017123");
    });

    it("has a denominator of 11", () => {
      expect(child.den()).to.equal(11);
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
      expect(tree.num()).to.equal(0);
    });
  });

  describe("when completing the first page of the first volume", () => {
    beforeEach(() => {
      description = tree.complete(
        [12345, "done", 0, 0, 0, "first page done"]);
    });

    it("has a numerator of 1", () => {
      expect(tree.num()).to.equal(1);
    });

    it("returns that page's description", () => {
      expect(description).to.equal("Finished 00000001.tif");
    });
  });
});
