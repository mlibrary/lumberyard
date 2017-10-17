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

  it_finally("resolves with an empty array",
    () => watcher(findFiles), value => {
      expect(value).toEqual([]);
    });

  describe("given a.txt is 'hello'", () => {
    beforeEach(() => {
      fakeFS.set("a.txt", "hello");
    });

    it_finally("resolves with ['a.txt']",
      () => watcher(findFiles), value => {
        expect(value).toEqual(["a.txt"]);
      });

    describe("and b.txt is created a second later", () => {
      beforeEach(() => {
        ticker.at(1, () => {
          fakeFS.set("b.txt", "holler");
        });
      });

      it_finally("resolves to contain a.txt",
        () => watcher(findFiles), value => {
          expect(value).toContain("a.txt");
        });

      it_finally("resolves to contain b.txt",
        () => watcher(findFiles), value => {
          expect(value).toContain("b.txt");
        });
    });
  });

  describe("given subdir/a.txt and subdir/b.txt exist", () => {
    beforeEach(() => {
      fakeFS.set("subdir/a.txt", "hey");
      fakeFS.set("subdir/b.txt", "ho");
    });

    it_finally("resolves with ['subdir']",
      () => watcher(findFiles), value => {
        expect(value).toEqual(["subdir"]);
      });
  });
});
