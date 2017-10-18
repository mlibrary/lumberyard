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

    describe("and b.txt is created ten minutes later", () => {
      beforeEach(() => {
        ticker.at(600, () => {
          fakeFS.set("b.txt", "holler");
        });
      });

      it_finally("resolves without b.txt",
        () => watcher(findFiles), value => {
          expect(value).toNotContain("b.txt");
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

  describe("given twenty files are created over 20 seconds", () => {
    beforeEach(() => {
      fakeFS.set("01.txt", "first");

      ticker.at( 1, () => { fakeFS.set("02.txt", "second"); });
      ticker.at( 2, () => { fakeFS.set("03.txt", "third"); });
      ticker.at( 3, () => { fakeFS.set("04.txt", "fourth"); });
      ticker.at( 4, () => { fakeFS.set("05.txt", "fifth"); });
      ticker.at( 5, () => { fakeFS.set("06.txt", "sixth"); });
      ticker.at( 6, () => { fakeFS.set("07.txt", "seventh"); });
      ticker.at( 7, () => { fakeFS.set("08.txt", "eighth"); });
      ticker.at( 8, () => { fakeFS.set("09.txt", "ninth"); });
      ticker.at( 9, () => { fakeFS.set("10.txt", "tenth"); });
      ticker.at(10, () => { fakeFS.set("11.txt", "eleventh"); });
      ticker.at(11, () => { fakeFS.set("12.txt", "twelfth"); });
      ticker.at(12, () => { fakeFS.set("13.txt", "thirteenth"); });
      ticker.at(13, () => { fakeFS.set("14.txt", "fourteenth"); });
      ticker.at(14, () => { fakeFS.set("15.txt", "fifteenth"); });
      ticker.at(15, () => { fakeFS.set("16.txt", "sixteenth"); });
      ticker.at(16, () => { fakeFS.set("17.txt", "seventeenth"); });
      ticker.at(17, () => { fakeFS.set("18.txt", "eighteenth"); });
      ticker.at(18, () => { fakeFS.set("19.txt", "nineteenth"); });
      ticker.at(19, () => { fakeFS.set("20.txt", "twentieth"); });
    });

    it_finally("resolves to contain 20.txt",
      () => watcher(findFiles), value => {
        expect(value).toContain("20.txt");
      });
  });

  describe("given twenty subdir files are created over 20 seconds", () => {
    beforeEach(() => {
      fakeFS.set("s/01.txt", "first");

      ticker.at( 1, () => { fakeFS.set("s/02.txt", "second"); });
      ticker.at( 2, () => { fakeFS.set("s/03.txt", "third"); });
      ticker.at( 3, () => { fakeFS.set("s/04.txt", "fourth"); });
      ticker.at( 4, () => { fakeFS.set("s/05.txt", "fifth"); });
      ticker.at( 5, () => { fakeFS.set("s/06.txt", "sixth"); });
      ticker.at( 6, () => { fakeFS.set("s/07.txt", "seventh"); });
      ticker.at( 7, () => { fakeFS.set("s/08.txt", "eighth"); });
      ticker.at( 8, () => { fakeFS.set("s/09.txt", "ninth"); });
      ticker.at( 9, () => { fakeFS.set("s/10.txt", "tenth"); });
      ticker.at(10, () => { fakeFS.set("s/11.txt", "eleventh"); });
      ticker.at(11, () => { fakeFS.set("s/12.txt", "twelfth"); });
      ticker.at(12, () => { fakeFS.set("s/13.txt", "thirteenth"); });
      ticker.at(13, () => { fakeFS.set("s/14.txt", "fourteenth"); });
      ticker.at(14, () => { fakeFS.set("s/15.txt", "fifteenth"); });
      ticker.at(15, () => { fakeFS.set("s/16.txt", "sixteenth"); });
      ticker.at(16, () => { fakeFS.set("s/17.txt", "seventeenth"); });
      ticker.at(17, () => { fakeFS.set("s/18.txt", "eighteenth"); });
      ticker.at(18, () => { fakeFS.set("s/19.txt", "nineteenth"); });
      ticker.at(19, () => { fakeFS.set("s/20.txt", "twentieth"); });
    });

    it_finally("resolves to contain only 's'",
      () => watcher(findFiles), value => {
        expect(value).toEqual(["s"]);
      });

    it_finally("resolves with an fs containing s/20.txt",
      () => watcher(findFiles), value => {
        expect(fakeFS.has("s/20.txt")).toBe(true);
      });
  });
});
