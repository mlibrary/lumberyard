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

  it("throws an error when readdir() is called", done => {
    fsMock.readdir("there_are_no_files.txt", function(error, files) {
      expect(error).toBeDefined();
      done();
    });
  });

  describe("the stream from createReadStream()", () => {
    let stream;

    beforeEach(() => {
      stream = fsMock.createReadStream("fake.txt");
    });

    it("emits an 'error' event", done => {
      stream.on("error", function(error) {
        done();
      });
    });
  });
});
