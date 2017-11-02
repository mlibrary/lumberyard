// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;
const makePromise = require("../../lib/make-promise.js");

let promisedFunction;

describe("my own homescripted util.promisify() function", () => {
  describe("when given a function taking only a callback", () => {
    beforeEach(() => {
      promisedFunction = makePromise(callback => {
        callback();
      });
    });

    it("returns a promise-based function", () => {
      return promisedFunction().then(value => {
        expect(value).to.equal(undefined);
      });
    });
  });

  describe("when given a function that errors", () => {
    beforeEach(() => {
      promisedFunction = makePromise(callback => {
        callback("bad error");
      });
    });

    it("returns a rejecting function", () => {
      return new Promise((resolve, reject) => {
        promisedFunction().then(reject, resolve);
      }).then(error => {
        expect(error).to.equal("bad error");
      });
    });
  });

  describe("when given a function with a return value", () => {
    beforeEach(() => {
      promisedFunction = makePromise(callback => {
        callback(undefined, "return value");
      });
    });

    it("returns a function that resolves with the value", () => {
      return promisedFunction().then(value => {
        expect(value).to.equal("return value");
      })
    });
  });

  describe("when given a function with another argument", () => {
    beforeEach(() => {
      promisedFunction = makePromise((arg, callback) => {
        callback(undefined, arg);
      });
    });

    it("passes on the argument", () => {
      return promisedFunction("hey").then(value => {
        expect(value).to.equal("hey");
      });
    });
  });

  describe("when given a function with two arguments", () => {
    beforeEach(() => {
      promisedFunction = makePromise((first, second, callback) => {
        callback(undefined, [first, second]);
      });
    });

    it("passes on the arguments", () => {
      return promisedFunction("sup", "fren").then(value => {
        expect(value).to.deep.equal(["sup", "fren"]);
      });
    });
  });
});
