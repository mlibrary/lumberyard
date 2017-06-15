// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const processTree = require("../lib/process-tree");

let treeSpy = function(logTree) {
  let spy = { };

  spy.tree = logTree;

  spy.storeProcess = function(process) {
    spy.process = process;
  };

  spy.messages = [ ];
  spy.log = function(message) {
    spy.messages.push(message)
  };

  return spy;
};

let spy;
let spyOnTree = async function(done, setup) {
  spy = await processTree(treeSpy, setup)
  done();
};

describe("a processTree with no children", () => {
  beforeEach(done => {
    spyOnTree(done, function(o) { });
  });

  it("returns a spy", () => {
    expect(spy.tree).toBeDefined();
  });

  it("logs two messages once finished running", done => {
    spy.process.then(value => {
      expect(spy.messages.length).toBe(2);

      done();
    });
  });
});

describe("a lone processTree with some setup time", () => {
  beforeEach(done => {
    spyOnTree(done, function(o) {
      o.run = () => new Promise(function(resolve, reject) {
        setTimeout(() => {resolve();}, 50);
      });
    });
  });

  it("doesn't log both messages right away", () => {
    expect(spy.messages.length).toBeLessThan(2);
  });

  it("logs both messages in the end", done => {
    spy.process.then(value => {
      expect(spy.messages.length).toBe(2);

      done();
    });
  });
});

describe("a processTree with one child", () => {
  beforeEach(done => {
    spyOnTree(done, function(o) {
      o.add(() => {});

      o.runBefore = () => new Promise(function(resolve, reject) {
        setTimeout(() => {
          o.log("info", "run before");
          resolve();
        }, 10);
      });

      o.run = () => new Promise(function(resolve, reject) {
        setTimeout(() => {
          o.log("info", "run");
          resolve();
        }, 10);
      });

      o.runAfter = () => new Promise(function(resolve, reject) {
        setTimeout(() => {
          o.log("info", "run after");
          resolve();
        }, 10);
      });
    });
  });

  it("logs 7 messages", done => {
    spy.process.then(value => {
      expect(spy.messages.length).toBe(7);

      done();
    });
  });
});
