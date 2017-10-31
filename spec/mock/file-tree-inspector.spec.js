// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const MockInspector = require("./file-tree-inspector");
const crypto = require("crypto");

const expect = require("chai").expect;
const later = require("../helpers/later")(it);

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

  later.it("returns an empty mapping on getSizesUnder()",
    () => inspector.getSizesUnder("nothing-is-here"), value => {
      expect(value.size).to.equal(0);
    });

  later.itErrors("on any getChecksum()",
    () => inspector.getChecksum("not-a-file"));

  describe("given dir/a.txt is 'Holler!'", () => {
    beforeEach(() => {
      fakeFS.set("dir/a.txt", "Holler!");
    });

    later.it("finds dir/a.txt on getSizesUnder('dir')",
      () => inspector.getSizesUnder("dir"), value => {
        expect(value.get("dir/a.txt")).to.equal(7);
      });

    later.it("returns the expected getChecksum('dir/a.txt')",
      () => inspector.getChecksum("dir/a.txt"), value => {
        expect(value).to.equal(md5sum("Holler!"));
      });

    later.it("doesn't find dir/a.txt on getSizesUnder('other')",
      () => inspector.getSizesUnder("other"), value => {
        expect(value.has("dir/a.txt")).to.equal(false);
      });
  });
});
