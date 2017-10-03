// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Emitter = require("../../../lib/mock/emitter");
let emitter;

describe("a default instance of Emitter()", () => {
  beforeEach(() => {
    emitter = Emitter();
  });

  it("doesn't raise an error", () => {
  });
});
