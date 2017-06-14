// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const processTree = require("../lib/process-tree");

let treeSpy = function(logTree, runningProcess) {
  let spy = { };

  spy.tree = logTree;
  spy.process = runningProcess;

  spy.messages = [ ];
  spy.log = function(message) {
    spy.messages.push(message)
  };

  return spy;
};

let spy;
let spyOnTree = function(done, setup) {
  processTree(treeSpy, setup).then(logger => {
    spy = logger;
    done();
  });
};

describe("a processTree with no children", () => {
  beforeEach(done => {
    spyOnTree(done, function(o) { });
  });

  it("returns a spy", () => {
    expect(spy.tree).toBeDefined();
  });
});
