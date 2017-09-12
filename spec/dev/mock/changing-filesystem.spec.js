// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const ChangingFSMock = require("../../../lib/mock/changing-filesystem");
let fsMock;

describe("an empty filesystem mock", () => {
  beforeEach(() => {
    fsMock = ChangingFSMock();
  });

  it("throws an error when stat() is called", done => {
    fsMock.stat("any_file_path.txt", function(error, stats) {
      expect(error).toBeDefined();
      done();
    });
  });
});
