// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const ChangingFSMock = require("../../../lib/mock/filesystem");
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

    it("doesn't emit a 'data' event", done => {
      setTimeout(function() {
        done();
      }, 50);

      stream.on("error", () => {});

      stream.on("data", function(chunk) {
        throw "emitted 'data' event";
      });
    });
  });

  describe("after setting fake_file.txt to 'some contents'", () => {
    beforeEach(() => {
      fsMock.set("fake_file.txt", "some contents");
    });

    it("can stat fake_file.txt without error", done => {
      fsMock.stat("fake_file.txt", function(error, stats) {
        expect(error).toBeUndefined();
        done();
      });
    });

    it("streams 'some contents' when read", done => {
      let stream = fsMock.createReadStream("fake_file.txt");
      stream.on("data", function(chunk) {
        expect(chunk).toBe("some contents");
        done();
      });
    });

    describe("fake_file.txt's stats object", () => {
      let fakefile_stats;

      beforeEach(done => {
        fsMock.stat("fake_file.txt", function(error, stats) {
          expect(error).toBeUndefined();
          fakefile_stats = stats;
          done();
        });
      });

      it("stats.isDirectory() returns false", () => {
        expect(fakefile_stats.isDirectory()).toBe(false);
      });

      it("stats.size is 13", () => {
        expect(fakefile_stats.size).toBe(13);
      });
    });

    describe("after setting another.txt to 'new stuff'", () => {
      beforeEach(() => {
        fsMock.set("another.txt", "new stuff");
      });

      it("can still stat fake_file.txt without error", done => {
        fsMock.stat("fake_file.txt", function(error, stats) {
          expect(error).toBeUndefined();
          done();
        });
      });

      it("streams 'some contents' when fake_file.txt is read", done => {
        let stream = fsMock.createReadStream("fake_file.txt");
        stream.on("data", function(chunk) {
          expect(chunk).toBe("some contents");
          done();
        });
      });

      it("can stat another.txt without error", done => {
        fsMock.stat("another.txt", function(error, stats) {
          expect(error).toBeUndefined();
          done();
        });
      });

      it("streams 'new stuff' when another.txt is read", done => {
        let stream = fsMock.createReadStream("another.txt");
        stream.on("data", function(chunk) {
          expect(chunk).toBe("new stuff");
          done();
        });
      });

      it("knows another.txt has a file size of 9", done => {
        fsMock.stat("another.txt", function(error, stats) {
          expect(stats.size).toBe(9);
          done();
        });
      });
    });

    describe("after setting fake_file.txt to 'new data'", () => {
      beforeEach(() => {
        fsMock.set("fake_file.txt", "new data");
      });

      it("streams 'new data' when fake_file.txt is read", done => {
        let stream = fsMock.createReadStream("fake_file.txt");
        stream.on("data", function(chunk) {
          expect(chunk).toBe("new data");
          done();
        });
      });
    });

    describe("after deleting fake_file.txt", () => {
      beforeEach(() => {
        fsMock.delete("fake_file.txt");
      });

      it("throws an error on stat('fake_file.txt')", done => {
        fsMock.stat("fake_file.txt", function(error, stats) {
          expect(error).toBeDefined();
          done();
        });
      });
    });
  });

  it("can create a directory", () => {
    fsMock.mkdir("subdir");
  });
});
