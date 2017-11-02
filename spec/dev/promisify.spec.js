// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;
const promisify = require("../../lib/promisify.js");

let promisedFunction;

describe("my own homescripted promisify() function", () => {
  describe("when given a function taking only a callback", () => {
    beforeEach(() => {
      promisedFunction = promisify(callback => {
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
      promisedFunction = promisify(callback => {
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
      promisedFunction = promisify(callback => {
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
      promisedFunction = promisify((arg, callback) => {
        callback(undefined, arg);
      });
    });

    it("passes on the argument", () => {
      return promisedFunction("hey").then(value => {
      });
    });
  });
});
