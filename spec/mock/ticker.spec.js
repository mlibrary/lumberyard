// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Ticker = require("./ticker");

let ticker;

describe("an instance of Ticker()", () => {
  beforeEach(() => {
    ticker = Ticker();
  });

  it("returns a promise on tick()", () => {
    let n = 0;

    runs(() => {
      ticker.tick().then(() => {
        n += 1;
      });
    });

    waitsFor(() => {
      return (n > 0);
    }, "tick() to finish", 50);

    runs(() => {
      expect(n).toBe(1);
    });
  });

  describe("when given a task to increment n", () => {
    let n;

    beforeEach(() => {
      n = 0;
      ticker.at(1, () => {
        n += 1;
      });
    });

    it("can be given a task", () => {
      let ticksHappened = false;

      runs(() => {
        ticker.tick().then(() => {
          ticksHappened = true;
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "tick() to finish", 50);

      runs(() => {
        expect(n).toBe(1);
      });
    });

    it("can queue multiple tasks", () => {
      let ticksHappened = false;
      let m = 0;

      runs(() => {
        ticker.at(1, () => {
          m += 1;
        });

        ticker.tick().then(() => {
          ticksHappened = true;
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "tick() to finish", 50);

      runs(() => {
        expect(n).toBe(1);
        expect(m).toBe(1);
      });
    });

    it("does nothing on tick(0)", () => {
      let ticksHappened = false;

      runs(() => {
        ticker.tick(0).then(() => {
          ticksHappened = true;
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "0 ticks to complete", 50);

      runs(() => {
        expect(n).toBe(0);
      });
    });
  });

  describe("when given a task to increment n at 3", () => {
    let n;

    beforeEach(() => {
      n = 0;
      ticker.at(3, () => {
        n += 1;
      });
    });

    it("doesn't increment during the first two ticks", () => {
      let ticksHappened = false;

      runs(() => {
        ticker.tick().then(() => {
          ticker.tick().then(() => {
            ticksHappened = true;
          });
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "2 ticks to complete", 50);

      runs(() => {
        expect(n).toBe(0);
      });
    });

    it("increments during the third tick", () => {
      let ticksHappened = false;

      runs(() => {
        ticker.tick().then(() => {
          ticker.tick().then(() => {
            ticker.tick().then(() => {
              ticksHappened = true;
            });
          });
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "3 ticks to complete", 50);

      runs(() => {
        expect(n).toBe(1);
      });
    });

    it("increments after tick(3)", () => {
      let ticksHappened = false;

      runs(() => {
        ticker.tick(3).then(() => {
          ticksHappened = true;
        });
      });

      waitsFor(() => {
        return ticksHappened;
      }, "3 ticks to complete", 50);

      runs(() => {
        expect(n).toBe(1);
      });
    });
  });
});
