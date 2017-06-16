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

describe("a processTree with one child and some delays", () => {
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

  describe("the resulting log", () => {
    beforeEach(done => {
      spy.process.then(value => {done();});
    });

    it("has 7 messages", () => {
      expect(spy.messages.length).toBe(7);
    });

    it("starts with a 'begin' message", () => {
      expect(spy.messages[0][1]).toBe("begin");
    });

    it("runs runBefore() first", () => {
      expect(spy.messages[1][2]).toBe("run before");
    });

    it("runs run() after runBefore()", () => {
      expect(spy.messages[2][2]).toBe("run");
    });

    it("logs a second 'begin' after run()", () => {
      expect(spy.messages[3][1]).toBe("begin");
    });

    it("logs a 'done' right after the second 'begin'", () => {
      expect(spy.messages[4][1]).toBe("done");
    });

    it("runs runAfter() after children are done", () => {
      expect(spy.messages[5][2]).toBe("run after");
    });

    it("finishes with a final 'done'", () => {
      expect(spy.messages[6][1]).toBe("done");
    });
  });
});

describe("a binary processTree with four grandchildren", () => {
  beforeEach(done => {
    let add_two_leaf_nodes = function(o) {
      o.add(() => {});
      o.add(() => {});
    };

    let add_two_parent_nodes = function(o) {
      o.add(add_two_leaf_nodes);
      o.add(add_two_leaf_nodes);
    };

    spyOnTree(done, add_two_parent_nodes);
  });

  describe("the resulting log", () => {
    beforeEach(done => {
      spy.process.then(value => {done();});
    });

    it("has 14 messages", () => {
      expect(spy.messages.length).toBe(14);
    });

    describe("its first message", () => {
      it("has a 'begin' code", () => {
        expect(spy.messages[0][1]).toBe("begin");
      });

      it("has an empty message", () => {
        expect(spy.messages[0][2]).toBe("");
      });
    });

    describe("its second message", () => {
      it("has a 'begin' code", () => {
        expect(spy.messages[1][1]).toBe("begin");
      });

      it("has an address of [0]", () => {
        expect(spy.messages[1][2]).toBe(0);
      });
    });
  });
});
