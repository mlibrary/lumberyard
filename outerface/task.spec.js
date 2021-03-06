// Copyright (c) 2018 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const Task = require("..").Task;

const fs = require("fs");
const makePromise = require("../lib/make-promise");

const mkdir = makePromise(fs.mkdir);
const readFile = makePromise(fs.readFile);
const readdir = makePromise(fs.readdir);
const rename = makePromise(fs.rename);
const rm = makePromise(fs.unlink);
const rmdir = makePromise(fs.rmdir);
const stat = makePromise(fs.stat);
const writeFile = makePromise(fs.writeFile);

let task;
let currentPWD = "";
const setNewPWD = pwd => new Promise(function(resolve) {
  currentPWD = pwd;
  resolve();
});

describe("in an environment with 'watch' and 'run' directories", () => {
  beforeEach(() => {
    return mkdir("test_task").then(() => {
      return Promise.all([
        mkdir("test_task/watch"),
        mkdir("test_task/run")
      ]);
    });
  });

  afterEach(() => {
    return Promise.all([
      rmdir("test_task/watch"),
      rmdir("test_task/run")
    ]).then(() => {
      return rmdir("test_task");
    });
  });

  describe("Task('watch', 'run/tmp', setNewPWD)", () => {
    beforeEach(() => {
      task = Task("test_task/watch", "test_task/run/tmp", setNewPWD);
    });

    it("finds no files", () => {
      return task.find().then(list => {
        expect(list).to.deep.equal([]);
      });
    });

    it("sets the pwd when it's run", () => {
      currentPWD = "unset";
      return task.run("new value").then(() => {
        expect(currentPWD).to.equal("new value");
      });
    });

    describe("when 'file.txt' is added to 'watch'", () => {
      beforeEach(() => {
        return writeFile("test_task/watch/file.txt", "hey\n");
      });

      afterEach(() => {
        return rm("test_task/watch/file.txt");
      });

      it("finds ['watch/file.txt']", () => {
        return task.find().then(list => {
          expect(list).to.deep.equal(["test_task/watch/file.txt"]);
        });
      });

      describe("after running task.move(['watch/file.txt'])", () => {
        beforeEach(() => {
          return task.move(["test_task/watch/file.txt"]);
        });

        afterEach(() => {
          return rename("test_task/run/tmp/file.txt",
                        "test_task/watch/file.txt").then(() => {
            return rmdir("test_task/run/tmp");
          });
        });

        it("creates 'run/tmp'", () => {
          return stat("test_task/run/tmp").then(stats => {
            expect(stats.isDirectory()).to.equal(true);
          });
        });

        it("moves file.txt into run/tmp", () => {
          return readFile("test_task/run/tmp/file.txt", contents => {
            expect(contents).to.equal("hey\n");
          });
        });

        it("definitely isn't just copying the file", () => {
          return readdir("test_task/watch").then(files => {
            expect(files).to.deep.equal([]);
          });
        });
      });

      describe("but 'run/tmp' already exists", () => {
        beforeEach(() => {
          return mkdir("test_task/run/tmp");
        });

        afterEach(() => {
          return rmdir("test_task/run/tmp");
        });

        describe("after running task.move(['watch/file.txt'])", () => {
          beforeEach(() => {
            return task.move(["test_task/watch/file.txt"]);
          });

          afterEach(() => {
            return rename("test_task/run/tmp/file.txt",
                          "test_task/watch/file.txt");
          });

          it("moves file.txt into run/tmp", () => {
            return readFile("test_task/run/tmp/file.txt", contents => {
              expect(contents).to.equal("hey\n");
            });
          });
        });
      });
    });
  });
});
