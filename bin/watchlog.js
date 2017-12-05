#!/usr/bin/env node
// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const tree = require("..").ProcessTree;

if (process.argv.length !== 3) {
  console.log("Expected a filename argument");
  process.exit(1);
}

tree(process.argv[2]).catch(() => {
  process.exit(1);
});
