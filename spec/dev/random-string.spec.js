// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;

const randomString = require("../../lib/random-string");

describe("the randomString() function", () => {
  it("returns a six-character string by default", () => {
    expect(randomString()).to.have.lengthOf(6);
  });

  it("returns different strings", () => {
    let results = new Set();

    for (let i = 0; i < 100; i += 1)
      results.add(randomString());

    expect(results.size).to.be.above(1);
  });

  it("returns an eight-character string when given XXXXXXXX", () => {
    expect(randomString("XXXXXXXX")).to.have.lengthOf(8);
  });

  it("returns a four-character string when given XXXX", () => {
    expect(randomString("XXXX")).to.have.lengthOf(4);
  });

  it("leaves the prefix alone when given hey-XXXX", () => {
    expect(randomString("hey-XXXX")).to.match(/^hey-....$/);
  });
});
