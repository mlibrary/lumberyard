// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(it) {
  let later = {};

  later.it = function(description, toDo, onResolve, onReject) {
    it(description, done => {
      toDo().then(value => {
        if (typeof onResolve === "undefined")
          expect(value).toBe("an error");

        else
          onResolve(value);

        done();

      }, error => {
        if (typeof onReject === "undefined")
          expect(error).toBe("not an error");

        else
          onReject(error);

        done();
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

  return later;
};
