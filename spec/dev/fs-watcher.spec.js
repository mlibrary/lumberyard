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

let it_finally = function(description, toDo, onResolve, onReject) {
  it(description, done => {
    toDo().then(value => {
      if (typeof onResolve === "undefined")
        expect(value).toBe("an error");

      else
        onResolve(value);

      done();

    }, error => {
      if (typeof onReject === "undefined")
        expect(error).toBe("not an error");

      else
        onReject(error);

      done();
    });
  });
};

describe("an fsWatcher() instance in an empty filesystem", () => {
  beforeEach(() => {
    let mockObj = MockInspector();

    ticker = Ticker();
    fakeFS = mockObj.fs;

    watcher = fsWatcher({"tick": ticker.tick,
                         "inspector": mockObj.inspector});
  });

  it_finally("returns an empty array",
    () => watcher(findFiles), value => {
      expect(value).toEqual([]);
    });
});
