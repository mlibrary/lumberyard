// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const expect = require("chai").expect;
const processTree = require("../../lib/process-tree");

let treeSpy = function(logTree) {
  let spy = { };

  spy.tree = logTree;

  spy.storeProcess = function(process) {
    spy.process = process;
  };

  spy.messages = [ ];
  spy.log = function(message) {
    spy.messages.push(message);
  };

  return spy;
};

let spy;
let spyOnTree = (done, setup) => new Promise(function(resolve, reject) {
  processTree(treeSpy, setup).then(value => {
    spy = value;
    done();
  }, reject);
});

describe("a processTree with no children", () => {
  beforeEach(done => {
    spyOnTree(done, o => {});
  });

  it("returns a spy", () => {
    expect(spy.tree).to.exist;
  });

  it("logs two messages once finished running", done => {
    spy.process.then(value => {
      expect(spy.messages.length).to.equal(2);

      done();
    });
  });

  it("has no description", () => {
    expect(spy.tree.d || "").to.equal("");
  });
});

describe("a lone processTree with some setup time", () => {
  beforeEach(done => {
    spyOnTree(done, o => {
      o.run = () => new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, 50);
      });
    });
  });

  it("doesn't log both messages right away", () => {
    expect(spy.messages.length).to.be.below(2);
  });

  it("logs both messages in the end", done => {
    spy.process.then(value => {
      expect(spy.messages.length).to.equal(2);

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
    beforeEach(() => {
      return spy.process;
    });

    it("has 7 messages", () => {
      expect(spy.messages.length).to.equal(7);
    });

    it("starts with a 'begin' message", () => {
      expect(spy.messages[0][1]).to.equal("begin");
    });

    it("runs runBefore() first", () => {
      expect(spy.messages[1][2]).to.equal("run before");
    });

    it("runs run() after runBefore()", () => {
      expect(spy.messages[2][2]).to.equal("run");
    });

    it("logs a second 'begin' after run()", () => {
      expect(spy.messages[3][1]).to.equal("begin");
    });

    it("logs a 'done' right after the second 'begin'", () => {
      expect(spy.messages[4][1]).to.equal("done");
    });

    it("runs runAfter() after children are done", () => {
      expect(spy.messages[5][2]).to.equal("run after");
    });

    it("finishes with a final 'done'", () => {
      expect(spy.messages[6][1]).to.equal("done");
    });
  });
});

describe("a binary processTree with four grandchildren", () => {
  beforeEach(done => {
    let addTwoLeafNodes = o => {
      o.add(() => {});
      o.add(() => {});
    };

    let addTwoParentNodes = o => {
      o.add(addTwoLeafNodes);
      o.add(addTwoLeafNodes);
    };

    spyOnTree(done, addTwoParentNodes);
  });

  describe("its logTree", () => {
    it("has two children", () => {
      expect(spy.tree.c.length).to.equal(2);
    });

    it("has two grandchildren under its first child", () => {
      expect(spy.tree.c[0].c.length).to.equal(2);
    });

    it("has two grandchildren under its second child", () => {
      expect(spy.tree.c[1].c.length).to.equal(2);
    });
  });

  describe("the resulting log", () => {
    beforeEach(() => {
      return spy.process;
    });

    it("has 14 messages", () => {
      expect(spy.messages.length).to.equal(14);
    });

    describe("its first message", () => {
      it("has a 'begin' code", () => {
        expect(spy.messages[0][1]).to.equal("begin");
      });

      it("has an empty message", () => {
        expect(spy.messages[0][2]).to.equal("");
      });
    });

    describe("its second message", () => {
      it("has a 'begin' code", () => {
        expect(spy.messages[1][1]).to.equal("begin");
      });

      it("has an address of [0]", () => {
        expect(spy.messages[1][2]).to.equal(0);
      });
    });

    it("contains a begin [1] message", () => {
      let foundIt = false;
      for (let msg of spy.messages)
        if (msg[1] === "begin" && msg.length === 4 && msg[2] === 1)
          foundIt = true;

      expect(foundIt).to.equal(true);
    });

    it("contains a begin [1, 0] message", () => {
      let foundIt = false;
      for (let msg of spy.messages)
        if (msg[1] === "begin"
            && msg.length === 5
            && msg[2] === 1
            && msg[3] === 0)
          foundIt = true;

      expect(foundIt).to.equal(true);
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
    expect(spy.tree.d).to.equal("the lone root");
  });

  it("stores no children", () => {
    expect(spy.tree.c).to.deep.equal([]);
  });
});

describe("a two-node processTree with descriptions", () => {
  beforeEach(done => {
    spyOnTree(done, root => {
      root.description = "the root";

      root.add(leaf => {
        leaf.description = "the leaf";
      });
    });
  });

  it("remembers its root description", () => {
    expect(spy.tree.d).to.equal("the root");
  });

  it("stores one child", () => {
    expect(spy.tree.c.length).to.equal(1);
  });

  it("remembers its leaf description", () => {
    expect(spy.tree.c[0].d).to.equal("the leaf");
  });
});

describe("a tree with two failing nodes", () => {
  let error;

  beforeEach(() => {
    let addLeaf = (parentNode, id) => {
      parentNode.add(leaf => {
        leaf.description = "node " + id;
      });
    };

    error = undefined;

    return processTree(treeSpy, root => {
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

          throw Error("bad problem with node 2b");
        });

        addLeaf(middle, "2c");
      });

      root.add(middle => {
        middle.description = "node 3";

        addLeaf(middle, "3a");
        addLeaf(middle, "3b");
        addLeaf(middle, "3c");

        throw Error("bad problem with node 3");
      });
    }).catch(e => {
      error = e;
    });
  });

  it("raises an error", () => {
    expect(error).to.exist;
  });

  describe("the exception object", () => {
    it("has a description of 'the root'", () => {
      expect(error.description).to.equal("the root");
    });

    it("has no error messages", () => {
      expect(error.messages).to.deep.equal([]);
    });

    it("has two child exceptions", () => {
      expect(error.children.length).to.equal(2);
    });

    describe("its first child", () => {
      let firstChild;
      beforeEach(() => {
        firstChild = error.children[0];
      });

      it("has a description of 'node 2'", () => {
        expect(firstChild.description).to.equal("node 2");
      });

      it("has no error messages", () => {
        expect(firstChild.messages).to.deep.equal([]);
      });

      it("has one child exception", () => {
        expect(firstChild.children.length).to.equal(1);
      });

      describe("its only child (aka the grandchild)", () => {
        let grandchild;
        beforeEach(() => {
          grandchild = firstChild.children[0];
        });

        it("has a description of 'node 2b'", () => {
          expect(grandchild.description).to.equal("node 2b");
        });

        it("has no child exceptions", () => {
          expect(grandchild.children).to.deep.equal([]);
        });

        it("has the right error message", () => {
          expect(grandchild.messages).to.have.lengthOf(1);
          expect(grandchild.messages[0].message).to.equal(
            "bad problem with node 2b");
        });
      });
    });

    describe("its second child", () => {
      let secondChild;
      beforeEach(() => {
        secondChild = error.children[1];
      });

      it("has a description of 'node 3'", () => {
        expect(secondChild.description).to.equal("node 3");
      });

      it("has no child exceptions", () => {
        expect(secondChild.children).to.deep.equal([]);
      });

      it("has the right error message", () => {
        expect(secondChild.messages).to.have.lengthOf(1);
        expect(secondChild.messages[0].message).to.equal(
          "bad problem with node 3");
      });
    });
  });
});

describe("a tree that fails while running", () => {
  let results = {};

  results.setValidationError = e => {
    results.validationError = e;
  };

  results.setRunError = e => {
    results.runError = e;
  };

  results.setResult = v => {
    results.runResult = v;
  };

  beforeEach(() => {
    results.setValidationError(undefined);
    results.setRunError(undefined);
    results.setResult(undefined);

    return processTree(treeSpy, root => {
      root.description = "root";

      root.add(child => {
        child.description = "first child";

        child.run = () => {
          throw Error("uh oh uh oh");
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
            throw Error("a grandchild problem");
          };
        });
      });
    }).then(result => {
      spy = result;

      return spy.process;
    }, results.setValidationError).then(
      results.setResult, results.setRunError);
  });

  it("validates without any errors", () => {
    expect(results.validationError).not.to.exist;
  });

  it("receives a runtime error", () => {
    expect(results.runError).to.exist;
  });

  it("doesn't receive a result", () => {
    expect(results.runResult).not.to.exist;
  });

  describe("its runtime error", () => {
    it("has a description of 'root'", () => {
      expect(results.runError.description).to.equal("root");
    });

    it("has two children", () => {
      expect(results.runError.children.length).to.equal(2);
    });

    it("has no error messages of its own", () => {
      expect(results.runError.messages.length).to.equal(0);
    });

    describe("its first child", () => {
      let firstChild;
      beforeEach(() => {
        firstChild = results.runError.children[0];
      });

      it("has a description of 'first child'", () => {
        expect(firstChild.description).to.equal("first child");
      });
    });
  });
});

describe("a processTree with asynchronous validation", () => {
  beforeEach(done => {
    spyOnTree(done, root => new Promise(function(resolve, reject) {
      setTimeout(() => {
        root.add(child => {});

        resolve();
      }, 10);
    }));
  });

  it("stores the child", () => {
    expect(spy.tree.c.length).to.equal(1);
  });
});
