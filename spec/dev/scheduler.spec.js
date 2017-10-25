// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Scheduler = require("../../lib/scheduler");
const fsWatcher = require("../../lib/fs-watcher");
const MockInspector = require("../mock/file-tree-inspector");
const Ticker = require("../mock/ticker");

let scheduler = null;
let ticker = null;
let fakeFS = null;

let taskSpy = function(find) {
  let task = {};

  task.pwd = "";
  task.events = [];

  task.find = () => new Promise(function(resolve, reject) {
    resolve(find());
  });

  task.move = files => new Promise(function(resolve, reject) {
    task.events.push(["move", files]);
  });

  task.run = wd => new Promise(function(resolve, reject) {
    task.events.push(["run", wd]);
  });

  return task;
};

describe("in a mocked environment", () => {
  beforeEach(() => {
    let mockObj = MockInspector();

    ticker = Ticker();
    fakeFS = mockObj.fs;

    scheduler = Scheduler(
      {"watcher": fsWatcher({"tick": ticker.tick,
                             "inspector": mockObj.inspector})});
  });

  it("does nothing when given nothing", done => {
    scheduler({}).then(() => {
      done();

    }, error => {
      expect(error).toBe("not an error");
      done();
    });
  });
});
