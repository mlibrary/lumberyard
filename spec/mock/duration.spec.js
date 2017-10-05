// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Duration = require("./duration");

let ticker;

let tickThen = function(n, done, callback) {
  ticker.tick(n).then(function() {
    callback();
    done();

  }, function(error) {
    expect(error).toBe("not an error");
    done();
  });
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

    it("only pushes 'hi' once after additional ticks", done => {
      tickThen(5, done, function() {
        expect(changingArray).toEqual(["hi"]);
      });
    });

    describe("and then told to push 'matt' at 1", () => {
      beforeEach(() => {
        ticker.at(1, "push", "matt");
      });

      it("does nothing at first", () => {
        expect(changingArray).toEqual([]);
      });

      it("pushes 'hi' then 'matt' after 1 tick", done => {
        tickThen(1, done, function() {
          expect(changingArray).toEqual(["hi", "matt"]);
        });
      });
    });
  });

  describe("when told to push 'sup' at 3", () => {
    beforeEach(() => {
      ticker.at(3, "push", "sup");
    });

    it("doesn't alter the array", () => {
      expect(changingArray).toEqual([]);
    });

    it("doesn't alter the array after 2 ticks", done => {
      tickThen(2, done, function() {
        expect(changingArray).toEqual([]);
      });
    });

    it("pushes 'sup' to the array after 3 ticks", done => {
      tickThen(3, done, function() {
        expect(changingArray).toEqual(["sup"]);
      });
    });
  });
});
