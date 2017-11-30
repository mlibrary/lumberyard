// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const errorTree = require("../../lib/error-tree");

let error, lines;

describe("a single error on a single node", () => {
  beforeEach(() => {
    error = Error();
    error.description = "one node";
    error.messages = [Error("uh oh")];
    error.children = [];
  });

  describe("its array of lines", () => {
    beforeEach(() => {
      lines = errorTree.lines(error);
    });

    it("has 2 lines", () => {
      expect(lines).to.have.lengthOf(2);
    });

    it("starts with the node description", () => {
      expect(lines[0]).to.equal("one node:");
    });

    it("concludes with an indented error message", () => {
      expect(lines[1]).to.equal("  uh oh");
    });
  });

  describe("its JSON string", () => {
    beforeEach(() => {
    });
  });
});
