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
                             "inspector": mockObj.inspector})});
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
});
