// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const FileTreeInspector = require("../../lib/file-tree-inspector");
const fs = require("fs");

let inspector = null;

let writeFile = (path, data) => new Promise(function(resolve, reject) {
  fs.writeFile(path, data, function(err) {
    if (err)
      reject(err);
    else
      resolve(path);
  });
});

let rm = path => new Promise(function(resolve, reject) {
  fs.unlink(path, function(err) {
    if (err)
      reject(err);
    else
      resolve(path);
  });
});

let mkdir = path => new Promise(function(resolve, reject) {
  fs.mkdir(path, function(err) {
    if (err)
      reject(err);
    else
      resolve(path);
  });
});

let rmdir = path => new Promise(function(resolve, reject) {
  fs.rmdir(path, function(err) {
    if (err)
      reject(err);
    else
      resolve(path);
  });
});

describe("an instance of FileTreeInspector()", () => {
  beforeEach(() => {
    inspector = FileTreeInspector();
  });

  describe("given a tree of files and directories", () => {
    beforeEach(done => {
      let reject = err => {
        expect(err).toBe("not an error");
        done();
      };

      mkdir("fstest").then(() => {
        let files = [];

        files.push(writeFile("fstest/a.txt", "Hey there"));
        files.push(writeFile("fstest/b.txt", "Sup Matt"));

        Promise.all(files).then(() => {
          done();

        }, reject);
      }, reject);
    });

    it("can find a.txt", done => {
      inspector.getSizesUnder("fstest").then(value => {
        expect(value.get("fstest/a.txt")).toBe(9);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    it("can find b.txt", done => {
      inspector.getSizesUnder("fstest").then(value => {
        expect(value.get("fstest/b.txt")).toBe(8);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    afterEach(done => {
      let reject = err => {
        expect(err).toBe("not an error");
        done();
      };

      let files = [];

      files.push(rm("fstest/a.txt"));
      files.push(rm("fstest/b.txt"));

      Promise.all(files).then(() => {
        rmdir("fstest").then(() => {
          done();

        }, reject);
      }, reject);
    });
  });
});
