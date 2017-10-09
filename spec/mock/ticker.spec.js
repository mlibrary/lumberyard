// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Ticker = require("./ticker");

let ticker;

let aroundTick = function(tickCount, before, after) {
  return function() {
    let ticksHappened = false;

    runs(() => {
      if (typeof before !== "undefined")
        before();

      ticker.tick(tickCount).then(() => {
        ticksHappened = true;
      });
    });

    waitsFor(() => {
      return ticksHappened;
    }, "ticks to resolve", 50);

    runs(() => {
      if (typeof after !== "undefined")
        after();
    });
  };
};

describe("an instance of Ticker()", () => {
  beforeEach(() => {
    ticker = Ticker();
  });

  describe("when given a task to increment n", () => {
    let n, m;

    beforeEach(() => {
      n = 0;
      ticker.at(1, () => {
        n += 1;
      });
    });

    it("can be given a task", aroundTick(undefined, undefined, () => {
      expect(n).toBe(1);
    }));

    it("can queue multiple tasks", aroundTick(undefined, () => {
      m = 0;

      ticker.at(1, () => {
        m += 1;
      });

    }, () => {
      expect(n).toBe(1);
      expect(m).toBe(1);
    }));

    it("does nothing on tick(0)", aroundTick(0, undefined, () => {
      expect(n).toBe(0);
    }));
  });

  describe("when given a task to increment n at 3", () => {
    let n;

    beforeEach(() => {
      n = 0;
      ticker.at(3, () => {
        n += 1;
      });
    });

    it("doesn't increment during the first two ticks",
        aroundTick(2, undefined, () => {
      expect(n).toBe(0);
    }));

    it("increments during the third tick",
        aroundTick(3, undefined, () => {
      expect(n).toBe(1);
    }));
  });

  it("executes two promises in order", () => {
    let firstIsDone = false;
    let secondIsDone = false;
    let outOfOrder = false;

    runs(() => {
      ticker.at(1, () => new Promise(function(resolve) {
        setTimeout(() => {
          firstIsDone = true;

          if (secondIsDone)
            outOfOrder = true

          resolve();
        }, 1);
      }));

      ticker.at(1, () => new Promise(function(resolve) {
        secondIsDone = true;

        if (!firstIsDone)
          outOfOrder = true;

        resolve();
      }));

      ticker.tick();
    });

    waitsFor(() => {
      return (firstIsDone && secondIsDone);
    }, "ticks to resolve", 50);

    runs(() => {
      expect(outOfOrder).toBe(false);
    });
  });
});
