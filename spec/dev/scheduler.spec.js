// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Scheduler = require("../../lib/scheduler");
const fsWatcher = require("../../lib/fs-watcher");
const MockInspector = require("../mock/file-tree-inspector");
const Ticker = require("../mock/ticker");

const later = require("../helpers/later")(it);

let scheduler, ticker, fakeFS, tasks;
let theScheduler = later.customIt(() => scheduler(tasks));

let TaskSpy = function(find) {
  let task = {};

  task.pwd = "";
  task.log = [];

  task.find = () => new Promise(function(resolve, reject) {
    task.log.push(["find", null]);
    resolve(find());
  });

  task.move = files => new Promise(function(resolve, reject) {
    task.log.push(["move", files]);

    for (let file of files)
      for (let key of fakeFS.keys())
        if (key.startsWith(file))
          fakeFS.delete(key);

    find = () => [];

    resolve(task.pwd);
  });

  task.run = wd => new Promise(function(resolve, reject) {
    task.log.push(["run", wd]);
    resolve();
  });

  return task;
};

describe("in a mocked environment", () => {
  beforeEach(() => {
    let mockObj = MockInspector();

    tasks = {};
    ticker = Ticker();
    fakeFS = mockObj.fs;

    scheduler = Scheduler(
      {"watcher": fsWatcher({"tick": ticker.tick,
                             "inspector": mockObj.inspector}),
       "tick": ticker.tick});
  });

  theScheduler("runs to completion", () => {});

  describe("given a task which always finds no files", () => {
    beforeEach(() => {
      tasks.alwaysEmpty = TaskSpy(() => []);
    });

    theScheduler("runs task.find()", () => {
      expect(tasks.alwaysEmpty.log.length).toBeGreaterThan(0);
    });

    theScheduler("doesn't run task.move() or task.run()", () => {
      for (let line of tasks.alwaysEmpty.log)
        expect(line[0]).toBe("find");
    });
  });

  describe("with a.txt and a task which finds it", () => {
    beforeEach(() => {
      fakeFS.set("a.txt", "hello");
      tasks.atxt = TaskSpy(() => ["a.txt"]);
      tasks.atxt.pwd = "atxt_autodir";
    });

    theScheduler("runs task.move(['a.txt'])", () => {
      expect(tasks.atxt.log).toContain(["move", ["a.txt"]]);
    });

    theScheduler("runs task.run('atxt_autodir')", () => {
      expect(tasks.atxt.log).toContain(["run", "atxt_autodir"]);
    });

    describe("with b.txt in 10 seconds and a task for it", () => {
      beforeEach(() => {
        ticker.at(10, () => { fakeFS.set("b.txt", "ayyy"); });
        tasks.btxt = TaskSpy(() => {
          if (fakeFS.has("b.txt"))
            return ["b.txt"];

          else
            return [];
        });

        tasks.btxt.pwd = "btxt_autodir";
      });

      theScheduler("runs task.move() for b.txt", () => {
        expect(tasks.btxt.log).toContain(["move", ["b.txt"]]);
      });
    });
  });
});
