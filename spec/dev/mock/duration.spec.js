// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Duration = require("../../../lib/mock/duration");

let ticker;

describe("a duration without an object", () => {
  beforeEach(() => {
    ticker = Duration();
  });

  it("has a tick() method", () => {
    ticker.tick();
  });
});
