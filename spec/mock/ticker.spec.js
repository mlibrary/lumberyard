// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Ticker = require("./ticker");

let ticker;

describe("an instance of Ticker()", () => {
  beforeEach(() => {
    ticker = Ticker();
  });

  it("has a tick() method", () => {
    ticker.tick();
  });

  xit("returns a promise on tick()", () => {
    let n = 0;

    runs(() => {
      ticker.tick().then(() => {
        n += 1;
      });
    });

    waitsFor(() => {
      return (n > 0);
    }, "tick() to finish", 10);

    runs(() => {
      expect(n).toBe(1);
    });
  });
});
