// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const Later = require("./later");

let lastIt = {};
const fakeIt = function(description, testCallback) {
  lastIt.description = description;
  lastIt.callback = testCallback;
};

const later = Later(fakeIt);

describe("later.it", () => {
  it("errors on Promise.resolve()", () => {
    later.it("", () => Promise.resolve());

    let error;

    return lastIt.callback().catch(e => {
      error = e;
    }).then(() => {
      expect(error).to.be.an.instanceof(Error);
    });
  });

  it("errors on Promise.reject()", () => {
    later.it("", () => Promise.reject(Error()));

    let error;

    return lastIt.callback().catch(e => {
      error = e;
    }).then(() => {
      expect(error).to.be.an.instanceof(Error);
    });
  });
});

describe("later.itErrors", () => {
  it("errors on Promise.resolve()", () => {
    later.itErrors("", () => Promise.resolve());

    let error;

    return lastIt.callback().catch(e => {
      error = e;
    }).then(() => {
      expect(error).to.be.an.instanceof(Error);
    });
  });

  it("succeeds on Promise.reject()", () => {
    later.itErrors("", () => Promise.reject(Error()));
    return lastIt.callback();
  });

  it("accepts a post-rejection callback", () => {
    let x = 0;

    later.itErrors("", () => Promise.reject(Error()), () => {
      x += 1;
    });

    return lastIt.callback().then(() => {
      expect(x).to.equal(1);
    });
  });
});
