// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const MockInspector = require("./file-tree-inspector");
const crypto = require("crypto");

let inspector = null;

let md5sum = data => {
  return crypto.createHash("md5").update(data).digest("latin1");
};

describe("an instance of MockInspector()", () => {
  it("can be created", () => {
    inspector = MockInspector();
  });
});
