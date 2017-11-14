// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;

const tick = require("../lib/tick.js");

describe("the default tick() method", () => {
  it("takes one second to resolve", () => {
    const timestamp = Date.now();

    return tick().then(() => {
      expect(Date.now()).to.be.above(timestamp + 998);
      expect(Date.now()).to.be.below(timestamp + 1010);
    });
  });

  it("can take different amounts of time with an argument", () => {
    const timestamp = Date.now();

    return tick(0.01).then(() => {
      expect(Date.now()).to.be.above(timestamp + 8);
      expect(Date.now()).to.be.below(timestamp + 20);
    });
  });
});
