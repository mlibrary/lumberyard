// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;

const randomString = require("../../lib/random-string");

describe("the randomString() function", () => {
  it("returns a six-character string by default", () => {
    randomString();
  });
});
