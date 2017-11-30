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

    it("also describes the child", () => {
      expect(lines[1]).to.equal("  child:");
    });

    it("outputs its child's error", () => {
      expect(lines[2]).to.equal("    Error: yikes");
    });
  });
});

describe("a complicated tree of errors", () => {
  beforeEach(() => {
    const grandchild = Error();
    grandchild.description = "grandchild";
    grandchild.messages = [Error("a")];
    grandchild.children = [];

    const child1 = Error();
    child1.description = "first child";
    child1.messages = [Error("b"), Error("c")];
    child1.children = [grandchild];

    const child2 = Error();
    child2.description = "second child";
    child2.messages = [Error("d")];
    child2.children = [];

    const root = Error();
    root.description = "root";
    root.messages = [];
    root.children = [child1, child2];

    error = ErrorTree(root);
  });

  describeItsArrayOfLines(() => {
    it("outputs the right stuff in the right order", () => {
      expect(lines).to.deep.equal([
        "root:",
        "  first child:",
        "    Error: b",
        "    Error: c",
        "    grandchild:",
        "      Error: a",
        "  second child:",
        "    Error: d"
      ]);
    });
  });

  describeItsJsonString(() => {
    it("has all the right data", () => {
      expect(json).to.deep.equal({
        "description": "root",
        "messages": [],
        "children": [{
          "description": "first child",
          "messages": [
            "Error: b",
            "Error: c"
          ],
          "children": [{
            "description": "grandchild",
            "messages": ["Error: a"],
            "children": []
          }]
        }, {
          "description": "second child",
          "messages": ["Error: d"],
          "children": []
        }]
      });
    });
  });
});
