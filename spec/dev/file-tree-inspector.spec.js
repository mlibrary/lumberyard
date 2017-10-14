// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const FileTreeInspector = require("../../lib/file-tree-inspector");
const crypto = require("crypto");
const fs = require("fs");

let inspector = null;

let md5sum = data => {
  return crypto.createHash("md5").update(data).digest("latin1");
};

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
    // ./fstest/
    // |-- subdir/
    // |   |-- a.txt
    // |   |-- b.txt
    // |   \-- c.txt
    // |-- a.txt
    // \-- b.txt
    beforeEach(done => {
      let reject = err => {
        expect(err).toBe("not an error");
        done();
      };

      mkdir("fstest").then(() => {
        let files = [];

        files.push(writeFile("fstest/a.txt", "Hey there"));
        files.push(writeFile("fstest/b.txt", "Sup Matt"));
        files.push(mkdir("fstest/subdir"));

        Promise.all(files).then(() => {
          let subfiles = [];

          subfiles.push(writeFile("fstest/subdir/a.txt", "AAAAA"));
          subfiles.push(writeFile("fstest/subdir/b.txt", "BbBbB"));
          subfiles.push(writeFile("fstest/subdir/c.txt", "The Sea"));

          Promise.all(subfiles).then(() => {
            done();

          }, reject);
        }, reject);
      }, reject);
    });

    afterEach(done => {
      let reject = err => {
        expect(err).toBe("not an error");
        done();
      };

      let subfiles = [];

      subfiles.push(rm("fstest/subdir/a.txt"));
      subfiles.push(rm("fstest/subdir/b.txt"));
      subfiles.push(rm("fstest/subdir/c.txt"));

      Promise.all(subfiles).then(() => {
        let files = [];

        files.push(rm("fstest/a.txt"));
        files.push(rm("fstest/b.txt"));
        files.push(rmdir("fstest/subdir"));

        Promise.all(files).then(() => {
          rmdir("fstest").then(() => {
            done();

          }, reject);
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

    it("can find subdir/a.txt", done => {
      inspector.getSizesUnder("fstest").then(value => {
        expect(value.get("fstest/subdir/a.txt")).toBe(5);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    it("can find subdir/c.txt", done => {
      inspector.getSizesUnder("fstest").then(value => {
        expect(value.get("fstest/subdir/c.txt")).toBe(7);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    it("gives the right checksum for a.txt", done => {
      inspector.getChecksum("fstest/a.txt").then(value => {
        expect(value).toBe(md5sum("Hey there"));
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    it("can't find a checksum for a nonexistent file", done => {
      inspector.getChecksum("fstest/not-a-file.txt").then(value => {
        expect(value).toBe("an error instead of a checksum");
        done();

      }, err => {
        done();
      });
    });

    it("yields an empty size mapping for nonexistent paths", done => {
      inspector.getSizesUnder("fstest/not-a-dir").then(value => {
        expect(value.size).toBe(0);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });

    it("doesn't look at files not under the requested path", done => {
      inspector.getSizesUnder("fstest/subdir").then(value => {
        expect(value.has("fstest/a.txt")).toBe(false);
        done();

      }, err => {
        expect(err).toBe("not an error");
        done();
      });
    });
  });
});
