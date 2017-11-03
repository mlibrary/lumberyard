// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const pad = require("../../lib/pad");

describe("pad()", () => {
  for (let duple of [
    [0, "00"],
    [1, "01"],
    [5, "05"],
    [9, "09"],
    [10, "10"],
    [99, "99"]
  ])
    it("converts " + duple[0] + " to '" + duple[1] + "'", () => {
      expect(pad(duple[0])).to.equal(duple[1]);
    });
});
