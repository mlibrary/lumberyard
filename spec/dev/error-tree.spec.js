// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const ErrorTree = require("../../lib/error-tree");

let error, json, lines;

describe("a single error on a single node", () => {
  beforeEach(() => {
    const input = Error();
    input.description = "one node";
    input.messages = [Error("uh oh")];
    input.children = [];

    error = ErrorTree(input);
  });

  describe("its array of lines", () => {
    beforeEach(() => {
      lines = error.getLines();
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
      json = JSON.parse(error.getJSON());
    });

    it("has description, messages, and children", () => {
      const keys = new Set(["description", "messages", "children"]);

      for (const key in json)
        expect(keys).to.contain(key);

      for (const key of keys)
        expect(json).to.have.property(key);
    });

    it("has a description of 'one node'", () => {
      expect(json.description).to.equal("one node");
    });

    it("has a one-string array of messages", () => {
      expect(json.messages).to.have.lengthOf(1);
      expect(json.messages[0]).to.equal("uh oh");
    });

    it("has an empty array of children", () => {
      expect(json.children).to.deep.equal([]);
    });
  });
});
