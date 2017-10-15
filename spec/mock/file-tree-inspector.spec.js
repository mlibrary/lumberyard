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

let it_finally_errors = function(description, toDo, onReject) {
  if (typeof onReject === "undefined")
    onReject = () => {};

  it_finally("errors " + description, toDo, undefined, onReject);
};

describe("an instance of MockInspector()", () => {
  beforeEach(() => {
    let mock = MockInspector();

    inspector = mock.inspector;
    fakeFS = mock.fs;
  });

  it_finally("returns an empty mapping on getSizesUnder()",
    () => inspector.getSizesUnder("nothing-is-here"), value => {
      expect(value.size).toBe(0);
    });

  it_finally_errors("on any getChecksum()",
    () => inspector.getChecksum("not-a-file"));

  describe("given dir/a.txt is 'Holler!'", () => {
    beforeEach(() => {
      fakeFS.set("dir/a.txt", "Holler!");
    });

    it_finally("finds dir/a.txt on getSizesUnder('dir')",
      () => inspector.getSizesUnder("dir"), value => {
        expect(value.get("dir/a.txt")).toBe(7);
      });

    it_finally("returns the expected getChecksum('dir/a.txt')",
      () => inspector.getChecksum("dir/a.txt"), value => {
        expect(value).toBe(md5sum("Holler!"));
      });

    it_finally("doesn't find dir/a.txt on getSizesUnder('other')",
      () => inspector.getSizesUnder("other"), value => {
        expect(value.has("dir/a.txt")).toBe(false);
      });
  });
});
