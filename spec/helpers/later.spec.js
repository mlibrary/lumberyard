// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

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

    let error = undefined;

    return lastIt.callback().catch(e => {
      error = e;
    }).then(() => {
      expect(error).to.be.an.instanceof(Error);
    });;
  });

  it("errors on Promise.reject()", () => {
    later.it("", () => Promise.reject());

    let error = undefined;

    return lastIt.callback().catch(e => {
      error = e;
    }).then(() => {
      expect(error).to.be.an.instanceof(Error);
    });;
  });
});
