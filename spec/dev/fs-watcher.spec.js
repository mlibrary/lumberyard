// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const fsWatcher = require("../../lib/fs-watcher");
const MockInspector = require("../mock/file-tree-inspector");
const Ticker = require("../mock/ticker");

let watcher = null;
let fakeFS = null;
let ticker = null;

let findFiles = () => new Promise(function(resolve, reject) {
  let bases = new Set();

  for (let path of fakeFS.keys())
    bases.add(path.replace(/\/.*$/, ""));

  resolve([...bases]);
});

describe("an fsWatcher() instance in an empty filesystem", () => {
  beforeEach(() => {
    let mockObj = MockInspector();

    ticker = Ticker();
    fakeFS = mockObj.fs;

    watcher = fsWatcher({"tick": ticker.tick,
                         "inspector": mockObj.inspector});
  });

  it("can exist", () => {});
});
