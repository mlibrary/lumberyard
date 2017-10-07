// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const Emitter = require("./emitter");
let emitter;

describe("a default instance of Emitter()", () => {
  beforeEach(() => {
    emitter = Emitter();
  });

  it("has an emit() method", () => {
    emitter.emit("nothing");
  });

  it("has an on() method", () => {
    emitter.on("anything", () => {});
  });

  it("remembers on() callbacks when called before emit()", () => {
    let callbackWasCalled = false;

    runs(function() {
      emitter.on("do the test", function() {
        callbackWasCalled = true;
      });

      emitter.emit("do the test");
    });

    waitsFor(function() {
      return callbackWasCalled;
    }, "emitter to call 'do the test' callback", 50);
  });

  it("remembers emit() when on() is called after", () => {
    let callbackWasCalled = false;

    runs(function() {
      emitter.emit("send");

      emitter.on("send", function() {
        callbackWasCalled = true;
      });
    });

    waitsFor(function() {
      return callbackWasCalled;
    }, "emitter to call 'send' callback", 50);
  });
});
