// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;
const Ticker = require("./ticker");

let ticker;

let aroundTick = function(tickCount, before, after) {
  if (typeof before === "undefined")
    before = () => {};

  if (typeof after === "undefined")
    after = () => {};

  return function(done) {
    this.timeout(50);
    before();
    ticker.tick(tickCount).then(() => {
      after();
      done();
    }, done);
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
      expect(n).to.equal(1);
    }));

    it("can queue multiple tasks", aroundTick(undefined, () => {
      m = 0;

      ticker.at(1, () => {
        m += 1;
      });

    }, () => {
      expect(n).to.equal(1);
      expect(m).to.equal(1);
    }));

    it("does nothing on tick(0)", aroundTick(0, undefined, () => {
      expect(n).to.equal(0);
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
      expect(n).to.equal(0);
    }));

    it("increments during the third tick",
        aroundTick(3, undefined, () => {
      expect(n).to.equal(1);
    }));
  });

  it("executes two promises in order", function(done) {
    this.timeout(50);

    let firstIsDone = false;
    let secondIsDone = false;
    let outOfOrder = false;

    ticker.at(1, () => new Promise(function(resolve) {
      setTimeout(() => {
        firstIsDone = true;

        if (secondIsDone)
          outOfOrder = true;

        resolve();
      }, 1);
    }));

    ticker.at(1, () => new Promise(function(resolve) {
      secondIsDone = true;

      if (!firstIsDone)
        outOfOrder = true;

      resolve();
    }));

    ticker.tick().then(() => {
      expect(outOfOrder).to.equal(false);
      done();
    }, done);
  });

  it("rejects on thrown exception", function(done) {
    this.timeout(50);

    ticker.at(1, () => {
      throw "hi, matt!";
    });

    ticker.tick().then(() => {
      done("expected a rejection");

    }, error => {
      expect(error).to.equal("hi, matt!");
      done();
    });
  });

  it("rejects on promise rejection", function(done) {
    this.timeout(50);

    ticker.at(1, () => new Promise(function(resolve, reject) {
      reject("uh oh");
    }));

    ticker.tick().then(() => {
      done("expected a rejection");

    }, error => {
      expect(error).to.equal("uh oh");
      done();
    });
  });

  it("rejects when one of many promises rejects", function(done) {
    this.timeout(50);

    ticker.at(1, () => new Promise(function(resolve, reject) {
      reject("the first one fails");
    }));

    ticker.at(1, () => {});
    ticker.at(1, () => {});

    ticker.tick().then(() => {
      done("expected a rejection");

    }, error => {
      expect(error).to.equal("the first one fails");
      done();
    });
  });
});
