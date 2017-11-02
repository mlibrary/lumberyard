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
      return promisedFunction().then(() => {
      });
    });
  });
});
