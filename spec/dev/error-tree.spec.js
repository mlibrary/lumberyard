// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const ErrorTree = require("../../lib/error-tree");

let error, json, lines;

const describeItsArrayOfLines = function(callback) {
  describe("its array of lines", function() {
    beforeEach(function() {
      lines = error.getLines();
    });

    callback();
  });
};

const describeItsJsonString = function(callback) {
  describe("its JSON string", () => {
    beforeEach(() => {
      json = JSON.parse(error.getJSON());
    });

    it("has description, messages, and children", () => {
      const keys = new Set(["description", "messages", "children"]);

      for (const key in json)
        expect(keys).to.contain(key);

      for (const key of keys)
        expect(json).to.have.property(key);
    });

    callback();
  });
};

describe("a single error on a single node", () => {
  beforeEach(() => {
    const input = Error();
    input.description = "one node";
    input.messages = [Error("uh oh")];
    input.children = [];

    error = ErrorTree(input);
  });

  describeItsArrayOfLines(() => {
    it("has 2 lines", () => {
      expect(lines).to.have.lengthOf(2);
    });

    it("starts with the node description", () => {
      expect(lines[0]).to.equal("one node:");
    });

    it("concludes with an indented error message", () => {
      expect(lines[1]).to.equal("  Error: uh oh");
    });
  });

  describeItsJsonString(() => {
    it("has a description of 'one node'", () => {
      expect(json.description).to.equal("one node");
    });

    it("has a one-string array of messages", () => {
      expect(json.messages).to.have.lengthOf(1);
      expect(json.messages[0]).to.equal("Error: uh oh");
    });

    it("has an empty array of children", () => {
      expect(json.children).to.deep.equal([]);
    });
  });
});

describe("two errors on a single node", () => {
  beforeEach(() => {
    const input = Error();
    input.description = "just one";
    input.messages = [Error("one"), Error("two")];
    input.children = [];

    error = ErrorTree(input);
  });

  describeItsArrayOfLines(() => {
    it("has 3 lines", () => {
      expect(lines).to.have.lengthOf(3);
    });

    it("starts with the node description", () => {
      expect(lines[0]).to.equal("just one:");
    });

    it("concludes with both indented error messages", () => {
      expect(lines[1]).to.equal("  Error: one");
      expect(lines[2]).to.equal("  Error: two");
    });
  });

  describeItsJsonString(() => {
    it("has a description of 'just one'", () => {
      expect(json.description).to.equal("just one");
    });

    it("has both error messages", () => {
      expect(json.messages).to.have.lengthOf(2);
      expect(json.messages[0]).to.equal("Error: one");
      expect(json.messages[1]).to.equal("Error: two");
    });

    it("has an empty array of children", () => {
      expect(json.children).to.deep.equal([]);
    });
  });
});

describe("one error on a child node", () => {
  beforeEach(() => {
    const child = Error();
    child.description = "child";
    child.messages = [Error("yikes")];
    child.children = [];

    const root = Error();
    root.description = "parent";
    root.messages = [];
    root.children = [child];

    error = ErrorTree(root);
  });

  describeItsArrayOfLines(() => {
    it("has 3 lines", () => {
      expect(lines).to.have.lengthOf(3);
    });

    it("starts with the parent description", () => {
      expect(lines[0]).to.equal("parent:");
    });
  });
});
