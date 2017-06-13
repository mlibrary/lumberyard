// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const processTree = require("../lib/process-tree");

let treeSpy = function() {
  let spy = { };

  spy.messages = [ ];
  spy.log = function(message) {
    spy.messages.push(message)
  };

  return spy;
};

let spy, tree;

describe("a processTree with no children", () => {
  beforeEach(done => {
    processTree(treeSpy, function(o) { }).then(v => {
      tree = v;
      spy = tree.logger;
      done();
    });
  });

  it("logs no messages", () => {
    expect(spy.messages.length).toBe(0);
  });

  describe("when run", () => {
    beforeEach(done => {
      tree.run().then(done);
    });

    it("logs two messages", () => {
      expect(spy.messages.length).toBe(2);
    });

    it("starts with a begin message", () => {
      expect(spy.messages[0][1]).toBe("begin");
    });
  });
});
