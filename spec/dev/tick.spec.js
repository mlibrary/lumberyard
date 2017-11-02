// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;

const tick = require("../../lib/tick.js");

describe("the default tick() method", () => {
  it("takes one second to resolve", () => {
    let timestamp = Date.now();

    return tick().then(() => {
      expect(Date.now()).to.be.above(timestamp + 999);
      expect(Date.now()).to.be.below(timestamp + 1200);
    });
  });
});
