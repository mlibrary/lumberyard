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

describe("a duration based on an empty array", () => {
  let changingArray;

  beforeEach(() => {
    changingArray = [];
    ticker = Duration(changingArray);
  });

  describe("when told to push 'hi' at 1", () => {
    beforeEach(() => {
      ticker.at(1, "push", "hi");
    });

    it("the array is unaffected", () => {
      expect(changingArray).toEqual([]);
    });
  });
});
