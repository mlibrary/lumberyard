// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Duration = require("../../../lib/mock/duration");

let ticker;

let tickThen = function(n, done, callback) {
  let testRunner = function() {
    callback();
    done();
  };

  let errorHandler = function(error) {
    expect(error).toBe("not an error");
    done();
  };

  let singleTick = function(f) {
    return function() {
      ticker.tick().then(f, errorHandler);
    };
  };

  for (; n > 0; n -= 1) {
    let anotherTick = singleTick(testRunner);
    testRunner = anotherTick;
  }

  testRunner();
};

describe("a duration without an object", () => {
  beforeEach(() => {
    ticker = Duration();
  });

  it("has a tick() method which resolves", done => {
    tickThen(1, done, () => {});
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

    it("doesn't alter the array", () => {
      expect(changingArray).toEqual([]);
    });

    it("pushes 'hi' to the array after 1 tick", done => {
      tickThen(1, done, function() {
        expect(changingArray).toEqual(["hi"]);
      });
    });
  });
});
