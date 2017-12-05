// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const fs = require("fs");
const makePromise = require("../lib/make-promise");
const tick = require("../lib/tick");
const JsonlFollower = require("../lib/jsonl-follower");

const appendFile = makePromise(fs.appendFile);
const unlink = makePromise(fs.unlink);
const writeFile = makePromise(fs.writeFile);

let follower;

const makeError = function(reject) {
  return function(error) {
    reject(Error(error));
  };
};

describe("makeError() helper", () => {
  it("works as expected", () => {
    const calls = [];
    const e = makeError(error => {
      calls.push(error);
    });

    e("hi");
    expect(calls).to.have.lengthOf(1);
    expect(calls[0].toString()).to.equal("Error: hi");

    e("holler");
    expect(calls).to.have.lengthOf(2);
    expect(calls[1].toString()).to.equal("Error: holler");
  });
});

describe("JsonlFollower(filename, callback)", function() {
  this.timeout(10000);
  const filename = "test-log-follow.jsonl";

  afterEach(() => {
    return unlink(filename);
  });

  it("resolves with the expected value", () => {
    follower = JsonlFollower(filename, () => "hey");
    appendFile(filename, "0\n");
    return follower.then(value => {
      expect(value).to.equal("hey");
    });
  });

  it("throws an error when the file is truncated", () => {
    follower = JsonlFollower(filename, o => {
      if (o === "done")
        return "received done";
    });

    return new Promise((resolve, reject) => {
      appendFile(filename, "123\n").then(() => {
        return tick(2);
      }).then(() => {
        return writeFile(filename, "0\n");
      }).then(() => {
        return tick(2);
      }).then(() => {
        appendFile(filename, '"done"\n');
      });

      follower.then(makeError(reject), error => {
        expect(error.toString()).to.equal("Error: Expected appends, not rewrites: " + filename);
        resolve();
      });
    });
  });

  it("notices additional changes when processing lags", () => {
    follower = JsonlFollower(filename, o => {
      if (o === "done")
        return true;

      follower.tryToRead();
      appendFile(filename, '"done"\n');
    }, true);

    appendFile(filename, "0\n");

    return follower.proc;
  });

  describe("with a callback that logs each object", () => {
    let jsonLog;

    beforeEach(() => {
      jsonLog = [];

      follower = JsonlFollower(filename, x => {
        if (x === "done")
          return true;

        jsonLog.push(x);
      });
    });

    afterEach(() => {
      return Promise.all([appendFile(filename, '"done"\n'), follower]);
    });

    it("regards empty appends", () => {
      return appendFile(filename, "0\n").then(() => {
        return tick(2);
      }).then(() => {
        return appendFile(filename, "");
      }).then(() => {
        return tick(2);
      }).then(() => {
        expect(jsonLog).to.deep.equal([0]);
      });
    });

    it("notes all lines", () => {
      return appendFile(filename, "2\n").then(() => {
        return tick(1);
      }).then(() => {
        return appendFile(filename, "3");
      }).then(() => {
        return tick(1);
      }).then(() => {
        return appendFile(filename, "5");
      }).then(() => {
        return tick(1);
      }).then(() => {
        return appendFile(filename, "8\n");
      }).then(() => {
        return tick(1);
      }).then(() => {
        return appendFile(filename, "13\n");
      }).then(() => {
        return tick(2);
      }).then(() => {
        expect(jsonLog).to.deep.equal([2, 358, 13]);
      });
    });
  });
});
