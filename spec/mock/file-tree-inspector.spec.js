// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const MockInspector = require("./file-tree-inspector");
const crypto = require("crypto");

let inspector = null;
let fakeFS = null;

let md5sum = data => {
  return crypto.createHash("md5").update(data).digest("latin1");
};

describe("an instance of MockInspector()", () => {
  beforeEach(() => {
    let mock = MockInspector();

    inspector = mock.inspector;
    fakeFS = mock.fs;
  });

  it("returns an empty mapping on getSizesUnder()", done => {
    inspector.getSizesUnder("nothing-is-here").then(value => {
      expect(value.size).toBe(0);
      done();

    }, error => {
      expect(error).toBe("not an error");
      done();
    });
  });

  describe("given dir/a.txt is 'Holler!'", () => {
    beforeEach(() => {
      fakeFS.set("dir/a.txt", "Holler!");
    });

    it("finds dir/a.txt on getSizesUnder('dir')", done => {
      inspector.getSizesUnder("dir").then(value => {
        expect(value.get("dir/a.txt")).toBe(7);
        done();

      }, error => {
        expect(error).toBe("not an error");
        done();
      });
    });

    it("doesn't find dir/a.txt on getSizesUnder('other')", done => {
      inspector.getSizesUnder("other").then(value => {
        expect(value.has("dir/a.txt")).toBe(false);
        done();

      }, error => {
        expect(error).toBe("not an error");
        done();
      });
    });
  });
});
