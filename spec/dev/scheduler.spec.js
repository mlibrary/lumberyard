// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Scheduler = require("../../lib/scheduler");

let scheduler = null;

describe("a scheduler with no tasks", () => {
  beforeEach(() => {
    scheduler = Scheduler();
  });

  it("can exist", () => {});
});
