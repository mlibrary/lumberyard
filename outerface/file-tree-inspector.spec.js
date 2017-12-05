// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;
const later = require("../spec/helpers/later")(it);

const FileTreeInspector = require("..").FileTreeInspector;
const crypto = require("crypto");
const fs = require("fs");
const makePromise = require("../lib/make-promise");

const md5sum = data => {
  return crypto.createHash("md5").update(data).digest("latin1");
};

const writeFile = makePromise(fs.writeFile);
const rm = makePromise(fs.unlink);
const mkdir = makePromise(fs.mkdir);
const rmdir = makePromise(fs.rmdir);

let inspector;

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
    beforeEach(() => {
      return mkdir("fstest").then(() => {
        const files = [];

        files.push(writeFile("fstest/a.txt", "Hey there"));
        files.push(writeFile("fstest/b.txt", "Sup Matt"));
        files.push(mkdir("fstest/subdir"));

        return Promise.all(files);
      }).then(() => {
        const subfiles = [];

        subfiles.push(writeFile("fstest/subdir/a.txt", "AAAAA"));
        subfiles.push(writeFile("fstest/subdir/b.txt", "BbBbB"));
        subfiles.push(writeFile("fstest/subdir/c.txt", "The Sea"));

        return Promise.all(subfiles);
      });
    });

    afterEach(() => {
      const subfiles = [];

      subfiles.push(rm("fstest/subdir/a.txt"));
      subfiles.push(rm("fstest/subdir/b.txt"));
      subfiles.push(rm("fstest/subdir/c.txt"));

      return Promise.all(subfiles).then(() => {
        const files = [];

        files.push(rm("fstest/a.txt"));
        files.push(rm("fstest/b.txt"));
        files.push(rmdir("fstest/subdir"));

        return Promise.all(files);
      }).then(() => {
        return rmdir("fstest");
      });
    });

    later.it("can find a.txt",
             () => inspector.getSizesUnder("fstest"), value => {
               expect(value.get("fstest/a.txt")).to.equal(9);
             });

    later.it("can find b.txt",
             () => inspector.getSizesUnder("fstest"), value => {
               expect(value.get("fstest/b.txt")).to.equal(8);
             });

    later.it("can find subdir/a.txt",
             () => inspector.getSizesUnder("fstest"), value => {
               expect(value.get("fstest/subdir/a.txt")).to.equal(5);
             });

    later.it("can find subdir/c.txt",
             () => inspector.getSizesUnder("fstest"), value => {
               expect(value.get("fstest/subdir/c.txt")).to.equal(7);
             });

    later.it("gives the right checksum for a.txt",
             () => inspector.getChecksum("fstest/a.txt"), value => {
               expect(value).to.equal(md5sum("Hey there"));
             });

    later.itErrors("when told to checksum a nonexistent file",
                   () => inspector.getChecksum("fstest/not-there.txt"));

    later.it("yields an empty size mapping for nonexistent paths",
             () => inspector.getSizesUnder("fstest/fake"), value => {
               expect(value.size).to.equal(0);
             });

    later.it("doesn't look at files not under the requested path",
             () => inspector.getSizesUnder("fstest/subdir"), value => {
               expect(value.has("fstest/a.txt")).to.equal(false);
             });
  });
});
