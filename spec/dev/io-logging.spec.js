// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const expect = require("chai").expect;
const IOLogging = require("../../lib/io-logging");

let logSet;
let tree;

describe("IOLogging.ProcessTree({})", () => {
  it("returns an object", () => {
    expect(IOLogging.ProcessTree({})).to.exist;
  });
});

describe("IOLogging.ProcessTree({log: logFn})", () => {
  beforeEach(() => {
    logSet = new Set();
    tree = IOLogging.ProcessTree({"log": x => { logSet.add(x); }});
  });

  describe("when run with a one-node tree", () => {
    beforeEach(() => {
      return tree(root => {
        root.description = "just the one";
      });
    });

    it("logs four messages", () => {
      expect(logSet.size).to.equal(4);
    });
  });
});
