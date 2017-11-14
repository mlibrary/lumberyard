// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const fsWatcher = require("../../lib/fs-watcher");
const MockInspector = require("../mock/file-tree-inspector");
const Ticker = require("../mock/ticker");

const expect = require("chai").expect;
const later = require("../helpers/later")(it);

let watcher, fakeFS, ticker;

const findFiles = () => new Promise(function(resolve, reject) {
  const bases = new Set();

  for (const path of fakeFS.keys())
    bases.add(path.replace(/\/.*$/, ""));

  resolve([...bases]);
});

const theWatcher = later.customIt(() => watcher(findFiles));

const setAt = function(time, key, value) {
  ticker.at(time, () => {
    fakeFS.set(key, value);
  });
};

describe("an fsWatcher() instance in an empty filesystem", () => {
  beforeEach(() => {
    const mockObj = MockInspector();

    ticker = Ticker();
    fakeFS = mockObj.fs;

    watcher = fsWatcher({"tick": ticker.tick,
                         "inspector": mockObj.inspector});
  });

  theWatcher("resolves with an empty array", value => {
    expect(value).to.deep.equal([]);
  });

  describe("given a.txt is 'hello'", () => {
    beforeEach(() => {
      fakeFS.set("a.txt", "hello");
    });

    theWatcher("resolves with ['a.txt']", value => {
      expect(value).to.deep.equal(["a.txt"]);
    });

    describe("and b.txt is created a second later", () => {
      beforeEach(() => {
        setAt(1, "b.txt", "holler");
      });

      theWatcher("resolves to contain a.txt", value => {
        expect(value).to.include("a.txt");
      });

      theWatcher("resolves to contain b.txt", value => {
        expect(value).to.include("b.txt");
      });
    });

    describe("and b.txt is created ten minutes later", () => {
      beforeEach(() => {
        setAt(600, "b.txt", "holler");
      });

      theWatcher("resolves without b.txt", value => {
        expect(value).not.to.include("b.txt");
      });
    });

    describe("and a.txt becomes 'abcde' after 1 seconds", () => {
      beforeEach(() => {
        setAt(1, "a.txt", "abcde");
      });

      describe("and b.txt is 'yooo' at 2 seconds", () => {
        beforeEach(() => {
          setAt(2, "b.txt", "yooo");
        });

        theWatcher("resolves to contain b.txt", value => {
          expect(value).to.include("b.txt");
        });
      });
    });

    describe("and a.txt becomes 'abcde' after 30 seconds", () => {
      beforeEach(() => {
        setAt(30, "a.txt", "abcde");
      });

      theWatcher("resolves after a.txt changes", value => {
        expect(fakeFS.get("a.txt")).to.equal("abcde");
      });
    });
  });

  describe("given subdir/a.txt and subdir/b.txt exist", () => {
    beforeEach(() => {
      fakeFS.set("subdir/a.txt", "hey");
      fakeFS.set("subdir/b.txt", "ho");
    });

    theWatcher("resolves with ['subdir']", value => {
      expect(value).to.deep.equal(["subdir"]);
    });
  });

  describe("given twenty files are created over 20 seconds", () => {
    beforeEach(() => {
      fakeFS.set("01.txt", "first");

      setAt(1, "02.txt", "second");
      setAt(2, "03.txt", "third");
      setAt(3, "04.txt", "fourth");
      setAt(4, "05.txt", "fifth");
      setAt(5, "06.txt", "sixth");
      setAt(6, "07.txt", "seventh");
      setAt(7, "08.txt", "eighth");
      setAt(8, "09.txt", "ninth");
      setAt(9, "10.txt", "tenth");
      setAt(10, "11.txt", "eleventh");
      setAt(11, "12.txt", "twelfth");
      setAt(12, "13.txt", "thirteenth");
      setAt(13, "14.txt", "fourteenth");
      setAt(14, "15.txt", "fifteenth");
      setAt(15, "16.txt", "sixteenth");
      setAt(16, "17.txt", "seventeenth");
      setAt(17, "18.txt", "eighteenth");
      setAt(18, "19.txt", "nineteenth");
      setAt(19, "20.txt", "twentieth");
    });

    theWatcher("resolves to contain 20.txt", value => {
      expect(value).to.include("20.txt");
    });
  });

  describe("given twenty subdir files are created over 20 seconds", () => {
    beforeEach(() => {
      fakeFS.set("s/01.txt", "first");

      setAt(1, "s/02.txt", "second");
      setAt(2, "s/03.txt", "third");
      setAt(3, "s/04.txt", "fourth");
      setAt(4, "s/05.txt", "fifth");
      setAt(5, "s/06.txt", "sixth");
      setAt(6, "s/07.txt", "seventh");
      setAt(7, "s/08.txt", "eighth");
      setAt(8, "s/09.txt", "ninth");
      setAt(9, "s/10.txt", "tenth");
      setAt(10, "s/11.txt", "eleventh");
      setAt(11, "s/12.txt", "twelfth");
      setAt(12, "s/13.txt", "thirteenth");
      setAt(13, "s/14.txt", "fourteenth");
      setAt(14, "s/15.txt", "fifteenth");
      setAt(15, "s/16.txt", "sixteenth");
      setAt(16, "s/17.txt", "seventeenth");
      setAt(17, "s/18.txt", "eighteenth");
      setAt(18, "s/19.txt", "nineteenth");
      setAt(19, "s/20.txt", "twentieth");
    });

    theWatcher("resolves to contain only 's'", value => {
      expect(value).to.deep.equal(["s"]);
    });

    theWatcher("resolves with an fs containing s/20.txt", value => {
      expect(fakeFS.has("s/20.txt")).to.equal(true);
    });
  });
});

describe("an fsWatcher() given no parameters", () => {
  it("can be created without error", () => {
    watcher = fsWatcher();
  });
});
