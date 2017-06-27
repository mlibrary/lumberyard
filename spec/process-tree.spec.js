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
    spyOnTree(done, o => {});
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

  it("has no description", () => {
    expect(spy.tree.d || "").toBe("");
  });
});

describe("a lone processTree with some setup time", () => {
  beforeEach(done => {
    spyOnTree(done, o => {
      o.run = () => new Promise((resolve, reject) => {
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
    spyOnTree(done, o => {
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
    let add_two_leaf_nodes = o => {
      o.add(() => {});
      o.add(() => {});
    };

    let add_two_parent_nodes = o => {
      o.add(add_two_leaf_nodes);
      o.add(add_two_leaf_nodes);
    };

    spyOnTree(done, add_two_parent_nodes);
  });

  describe("its logTree", () => {
    it("has two children", () => {
      expect(spy.tree.c.length).toBe(2);
    });

    it("has two grandchildren under its first child", () => {
      expect(spy.tree.c[0].c.length).toBe(2);
    });

    it("has two grandchildren under its second child", () => {
      expect(spy.tree.c[1].c.length).toBe(2);
    });
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

    it("contains a begin [1] message", () => {
      let found_it = false;
      for (let msg of spy.messages)
        if (msg[1] === "begin" && msg.length === 4 && msg[2] === 1)
          found_it = true;

      expect(found_it).toBe(true);
    });

    it("contains a begin [1, 0] message", () => {
      let found_it = false;
      for (let msg of spy.messages)
        if (msg[1] === "begin" && msg.length === 5
            && msg[2] === 1 && msg[3] === 0)
          found_it = true;

      expect(found_it).toBe(true);
    });
  });
});

describe("a processTree with a description and no children", () => {
  beforeEach(done => {
    spyOnTree(done, o => {
      o.description = "the lone root";
    });
  });

  it("remembers its description", () => {
    expect(spy.tree.d).toBe("the lone root");
  });

  it("stores no children", () => {
    expect(spy.tree.c || []).toEqual([]);
  });
});

describe("a two-node processTree with descriptions", () => {
  beforeEach(done => {
    spyOnTree(done, root => {
      root.description = "the root";

      root.add(leaf => {
        leaf.description = "the leaf"
      });
    });
  });

  it("remembers its root description", () => {
    expect(spy.tree.d).toBe("the root");
  });

  it("stores one child", () => {
    expect(spy.tree.c.length).toBe(1);
  });

  it("remembers its leaf description", () => {
    expect(spy.tree.c[0].d).toBe("the leaf");
  });
});

describe("a tree with two failing nodes", () => {
  let error;

  beforeEach(done => {
    let addLeaf = (parentNode, id) => {
      parentNode.add(leaf => {
        leaf.description = "node " + id;
      });
    };

    error = undefined;

    Promise.resolve(processTree(treeSpy, root => {
      root.description = "the root";

      root.add(middle => {
        middle.description = "node 1";

        addLeaf(middle, "1a");
        addLeaf(middle, "1b");
        addLeaf(middle, "1c");
      });

      root.add(middle => {
        middle.description = "node 2";

        addLeaf(middle, "2a");

        middle.add(leaf => {
          leaf.description = "node 2b";

          throw "bad problem with node 2b";
        });

        addLeaf(middle, "2c");
      });

      root.add(middle => {
        middle.description = "node 3";

        addLeaf(middle, "3a");
        addLeaf(middle, "3b");
        addLeaf(middle, "3c");

        throw "bad problem with node 3";
      });

    })).then(v => {
      spy = v;
      done();

    }, e => {
      error = e;
      done();
    });
  });

  it("raises an error", () => {
    expect(error).toBeDefined();
  });

  describe("the exception object", () => {
    it("has a description of 'the root'", () => {
      expect(error.description).toBe("the root");
    });

    it("has no error messages", () => {
      expect(error.messages).toEqual([]);
    });

    it("has two child exceptions", () => {
      expect(error.children.length).toBe(2);
    });

    describe("its first child", () => {
      let first_child;
      beforeEach(() => {
        first_child = error.children[0];
      });

      it("has a description of 'node 2'", () => {
        expect(first_child.description).toBe("node 2");
      });

      it("has no error messages", () => {
        expect(first_child.messages).toEqual([]);
      });

      it("has one child exception", () => {
        expect(first_child.children.length).toBe(1);
      });

      describe("its only child (aka the grandchild)", () => {
        let grandchild;
        beforeEach(() => {
          grandchild = first_child.children[0];
        });

        it("has a description of 'node 2b'", () => {
          expect(grandchild.description).toBe("node 2b");
        });

        it("has no child exceptions", () => {
          expect(grandchild.children).toEqual([]);
        });

        it("has the right error message", () => {
          expect(grandchild.messages).toEqual(
            ["bad problem with node 2b"]);
        });
      });
    });

    describe("its second child", () => {
      let second_child;
      beforeEach(() => {
        second_child = error.children[1];
      });

      it("has a description of 'node 3'", () => {
        expect(second_child.description).toBe("node 3");
      });

      it("has no child exceptions", () => {
        expect(second_child.children).toEqual([]);
      });

      it("has the right error message", () => {
        expect(second_child.messages).toEqual(
          ["bad problem with node 3"]);
      });
    });
  });
});

describe("a tree that fails while running", () => {
  let validationError, runError, runResult;

  beforeEach(done => {
    validationError = undefined;
    runError = undefined;
    runResult = undefined;

    Promise.resolve(processTree(treeSpy, root => {
      root.description = "root";

      root.add(child => {
        child.description = "first child";

        child.run = () => {
          throw "uh oh uh oh";
        };
      });

      root.add(child => {
        child.description = "second child";
      });

      root.add(child => {
        child.description = "third child";

        child.add(grandchild => {
          grandchild.description = "only grandchild";

          grandchild.run = () => {
            throw "a grandchild problem";
          };
        });
      });
    })).then(result => {
      spy = result;
      spy.process.then(result => {
        runResult = result;
        done();

      }, e => {
        runError = e;
        done();
      });

    }, e => {
      validationError = e;
      done();
    });
  });

  it("validates without any errors", () => {
    expect(validationError).not.toBeDefined();
  });

  it("receives a runtime error", () => {
    expect(runError).toBeDefined();
  });

  it("doesn't receive a result", () => {
    expect(runResult).not.toBeDefined();
  });

  describe("its runtime error", () => {
    it("has a description of 'root'", () => {
      expect(runError.description).toBe("root");
    });
  });
});
