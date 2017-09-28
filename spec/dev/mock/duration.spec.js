// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Duration = require("../../../lib/mock/duration");

let ticker;

describe("a duration without an object", () => {
  beforeEach(() => {
    ticker = Duration();
  });

  it("has a tick() method which resolves", done => {
    ticker.tick().then(function() {
      done();
    }, function(error) {
      expect(error).toBe("not an error");
      done();
    });
  });
});

describe("a duration based on an array", () => {
  let changingArray;

  beforeEach(() => {
    changingArray = [];
    ticker = Duration(changingArray);
  });

  it("can be given an action", () => {
    ticker.at(1, "push", "hi");
  });
});
