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
  describe("with a set of messages", () => {
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

      it("says 'done'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Done.");
      });
    });

    describe("when run with a tree with a child", () => {
      beforeEach(() => {
        return tree(root => {
          root.description = "the parent";

          root.add(child => {
            child.description = "the child";
          });
        });
      });

      it("logs five messages", () => {
        expect(messages.size).to.equal(5);
      });

      it("says 'beginning setup and validation'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Beginning setup and validation ...");
      });

      it("says 'finished setup and validation'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Finished setup and validation (0/2) ...");
      });

      it("says 'finished the child'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Finished the child (1/2) ...");
      });

      it("says 'finished the parent'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Finished the parent (2/2) ...");
      });

      it("says 'done'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m Done.");
      });
    });

    describe("when run with a lot of extra log messages", () => {
      beforeEach(() => {
        return tree(root => {
          root.description = "rooot";

          root.run = () => {
            root.log("info", ":)");
            root.log("warn", ":|");
            root.log("error", ":(");
            root.log("weird", ":o");
          };
        });
      });

      it("logs seven messages", () => {
        expect(messages.size).to.equal(7);
      });

      it("says ':)'", () => {
        expect(messages).to.contain(
          "\x1b[1;32m *\x1b[0m :)");
      });

      it("says ':|'", () => {
        expect(messages).to.contain(
          "\x1b[1;33m *\x1b[0m :|");
      });

      it("says ':('", () => {
        expect(messages).to.contain(
          "\x1b[1;31m *\x1b[0m :(");
      });

      it("doesn't say ':o'", () => {
        for (const m of messages)
          expect(m).not.to.match(/:o$/);
      });
    });
  });

  describe("with a string of messages", () => {
    beforeEach(() => {
      messages = "";
      tree = IOLogging.ProcessTree({"log": x => {
        messages += x + "\n";
      }});
    });

    describe("when run with a single invalid node", () => {
      beforeEach(() => {
        return tree(root => {
          root.description = "hey now";
          throw Error("uh oh");
        });
      });

      it("errors after validation", () => {
        expect(messages.slice(14, 75)).to.equal(
          "Beginning setup and validation ...\n\x1b[1;31m *"
          + "\x1b[0m Full JSON: {");
      });
    });
  });
});
