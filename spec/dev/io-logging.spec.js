// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const expect = require("chai").expect;
const IOLogging = require("../../lib/io-logging");

let messages;
let tree;

describe("IOLogging.ProcessTree()", () => {
  it("returns an object", () => {
    expect(IOLogging.ProcessTree()).to.exist;
  });
});

describe("IOLogging.ProcessTree({log: logFn})", () => {
  beforeEach(() => {
    messages = new Set();
    tree = IOLogging.ProcessTree({"log": x => { messages.add(x); }});
  });

  describe("when run with a one-node tree", () => {
    beforeEach(() => {
      return tree(root => {
        root.description = "just the one";
      });
    });

    it("logs four messages", () => {
      expect(messages.size).to.equal(4);
    });

    it("says 'beginning setup and validation'", () => {
      expect(messages).to.contain(
        "\x1b[1;32m *\x1b[0m Beginning setup and validation ...");
    });

    it("says 'finished setup and validation'", () => {
      expect(messages).to.contain(
        "\x1b[1;32m *\x1b[0m Finished setup and validation (0/1) ...");
    });

    it("says 'finished just the one'", () => {
      expect(messages).to.contain(
        "\x1b[1;32m *\x1b[0m Finished just the one (1/1) ...");
    });
  });
});
