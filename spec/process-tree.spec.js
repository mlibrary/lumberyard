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
});
