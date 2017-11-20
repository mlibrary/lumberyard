// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const expect = require("chai").expect;
const IOLogging = require("../../lib/io-logging");

describe("IOLogging.ProcessTree()", () => {
  it("returns an object", () => {
    expect(IOLogging.ProcessTree()).to.exist;
  });
});
