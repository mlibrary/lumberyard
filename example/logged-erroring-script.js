#!/usr/bin/env node
// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const tree = require("..").ProcessTree;

tree(root => {
  root.description = "root";

  root.add(child => {
    child.description = "child";

    throw Error("uh oh");
  });

  root.add(child => {
    child.description = "ok child";
  });

  root.add(child => {
    child.description = "third child";

    throw Error("oh no");
  });
});
