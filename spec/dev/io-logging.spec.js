// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
const expect = require("chai").expect;
const fs = require("fs");
const makePromise = require("../../lib/make-promise");
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

      it("errors after beginning validation", () => {
        const match = messages.match(/^[^{]+\{/);
        expect(match).to.exist;

        expect(match[0]).to.equal(
          "\x1b[1;32m *\x1b[0m Beginning setup and validation ...\n"
          + "\x1b[1;31m *\x1b[0m Full JSON: {");
      });

      it("has the expected full json string", () => {
        const match = messages.match(/\{.*\}/);
        expect(match).to.exist;

        expect(JSON.parse(match[0])).to.deep.equal({
          "description": "hey now",
          "messages": ["Error: uh oh"],
          "children": []
        });
      });

      it("ends with a readable printout", () => {
        const lines = messages.split("\n");
        expect(lines).to.have.lengthOf(5);
        expect(lines[2]).to.equal("\x1b[1;31m *\x1b[0m hey now:");
        expect(lines[3]).to.equal("\x1b[1;31m *\x1b[0m   Error: uh oh");
        expect(lines[4]).to.equal("");
      });
    });

    describe("when run with a node that fails at runtime", () => {
      beforeEach(() => {
        return tree(root => {
          root.description = "you're an all-star";
          root.run = () => {
            throw Error("get your game on");
          };
        });
      });

      it("errors after finishing validation", () => {
        const match = messages.match(/^[^{]+\{/);
        expect(match).to.exist;

        expect(match[0]).to.equal(
          "\x1b[1;32m *\x1b[0m Beginning setup and validation ...\n"
          + "\x1b[1;32m *\x1b[0m Finished setup and validation (0/1) ...\n"
          + "\x1b[1;31m *\x1b[0m Full JSON: {");
      });

      it("has the expected full json string", () => {
        const match = messages.match(/\{.*\}/);
        expect(match).to.exist;

        expect(JSON.parse(match[0])).to.deep.equal({
          "description": "you're an all-star",
          "messages": ["Error: get your game on"],
          "children": []
        });
      });

      it("ends with a readable printout", () => {
        const lines = messages.split("\n");
        expect(lines).to.have.lengthOf(6);
        expect(lines[3]).to.equal("\x1b[1;31m *\x1b[0m you're an all-star:");
        expect(lines[4]).to.equal("\x1b[1;31m *\x1b[0m   Error: get your game on");
        expect(lines[5]).to.equal("");
      });
    });

    xdescribe("when given a logfile", function() {
      this.timeout(6000);
      let lines, jsons, itSucceeded;

      const logfile = "io_logtest_out.jsonl";
      const rm = makePromise(fs.unlink);
      const read = makePromise(fs.readFile);

      const runAndRead = function(callback) {
        lines = null;
        jsons = null;
        itSucceeded = null;

        return tree(logfile, callback).then(() => {
          return read(logfile);
        }).then(data => {
          lines = data.toString().split("\n");
          expect(lines.pop()).to.equal("");

          jsons = [];
          for (const line of lines)
            jsons.push(JSON.parse(line));

          expect(messages).to.equal("");

          return tree(logfile).then(() => {
            itSucceeded = true;
          }, () => {
            itSucceeded = false;
          });
        });
      };

      afterEach(() => {
        return rm(logfile);
      });

      describe("and run with a single node", () => {
        beforeEach(() => {
          return runAndRead(root => {
            root.description = "root";
          });
        });

        it("outputs three json lines", () => {
          expect(jsons).to.have.lengthOf(3);
        });

        it("posts the logtree first", () => {
          expect(jsons[0][1]).to.equal("log-tree");
          expect(jsons[0][2]).to.deep.equal({
            "c": [],
            "d": "root"
          });
        });

        it("posts a 'begin' message second", () => {
          expect(jsons[1]).to.have.lengthOf(3);
          expect(jsons[1][1]).to.equal("begin");
        });

        it("posts a 'done' message last", () => {
          expect(jsons[2]).to.have.lengthOf(3);
          expect(jsons[2][1]).to.equal("done");
        });

        it("can be converted into bulleted text", () => {
          expect(messages).to.equal(
            "\x1b[1;32m *\x1b[0m Beginning setup and validation ...\n"
            + "\x1b[1;32m *\x1b[0m Finished setup and validation (0/1) ...\n"
            + "\x1b[1;32m *\x1b[0m Finished root (1/1) ...\n"
            + "\x1b[1;32m *\x1b[0m Done.\n");
        });
      });

      describe("and run with four nodes", () => {
        beforeEach(() => {
          return runAndRead(root => {
            root.description = "parent";

            root.add(child => {
              child.description = "first child";

              child.add(grandchild => {
                grandchild.description = "grandchild";
              });
            });

            root.add(child => {
              child.description = "second child";
            });
          });
        });

        it("outputs nine json lines", () => {
          expect(jsons).to.have.lengthOf(9);
        });

        it("posts the logtree first", () => {
          expect(jsons[0][1]).to.equal("log-tree");
          expect(jsons[0][2]).to.deep.equal({
            "d": "parent",
            "c": [{
              "d": "first child",
              "c": [{
                "d": "grandchild",
                "c": []
              }]
            }, {
              "d": "second child",
              "c": []
            }]
          });
        });
      });

      describe("and run with an invalid node", () => {
        beforeEach(() => {
          return runAndRead(root => {
            root.description = "come in here dear boy";
            throw Error("have a cigar");
          });
        });

        it("outputs one json line", () => {
          expect(jsons).to.have.lengthOf(1);
        });

        it("only posts an error", () => {
          expect(jsons[0][1]).to.equal("fatal");
          expect(jsons[0][2]).to.deep.equal({
            "description": "come in here dear boy",
            "messages": ["Error: have a cigar"],
            "children": []
          });
        });

        it("can be converted into bulleted text", () => {
          expect(messages).to.equal(
            "\x1b[1;32m *\x1b[0m Beginning setup and validation ...\n"
            + "\x1b[1;31m *\x1b[0m come in here dear boy:\n"
            + "\x1b[1;31m *\x1b[0m   Error: have a cigar\n");
        });
      });

      describe("and run with a failing node", () => {
        beforeEach(() => {
          return runAndRead(root => {
            root.description = "you're gonna go far";

            root.run = () => {
              throw Error("you're gonna fly high");
            };
          });
        });

        it("outputs three json lines", () => {
          expect(jsons).to.have.lengthOf(3);
        });

        it("posts the logtree first", () => {
          expect(jsons[0][1]).to.equal("log-tree");
          expect(jsons[0][2]).to.deep.equal({
            "d": "you're gonna go far",
            "c": []
          });
        });

        it("logs its beginning", () => {
          expect(jsons[1][1]).to.equal("begin");
        });

        it("finishes with an error", () => {
          expect(jsons[2][1]).to.equal("fatal");
          expect(jsons[2][2]).to.deep.equal({
            "description": "you're gonna go far",
            "messages": ["Error: you're gonna fly high"],
            "children": []
          });
        });
      });
    });
  });
});
