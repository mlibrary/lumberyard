// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const expect = require("chai").expect;

module.exports = function(it) {
  let later = {};

  later.it = function(description, toDo, onResolve, onReject) {
    it(description, function() {
      return toDo().then(value => {
        if (typeof onResolve === "undefined")
          expect(value).to.equal("an error");

        else
          onResolve(value);

      }, error => {
        if (typeof onReject === "undefined")
          expect(error).toBe("not an error");

        else
          onReject(error);
      });
    });
  };

  later.itErrors = function(description, toDo, onReject) {
    if (typeof onReject === "undefined")
      onReject = () => {};

    later.it("errors " + description, toDo, undefined, onReject);
  };

  later.xit = () => {};
  later.xitErrors = () => {};

  later.customIt = function(toDo) {
    return function(description, onResolve, onReject) {
      later.it(description, toDo, onResolve, onReject);
    };
  };

  return later;
};
