#!/usr/bin/env node
// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const tree = require("../lib/cli-logger").QuickProcess;

tree(root => {
  root.description = "showing how this works";

  root.add(section => {
    section.description = "showing the first section";

    section.add(task => {
      task.description = "running the first task";

      task.run = () => {
        task.log("info", "The first task is running right now ...");
      };
    });

    section.add(task => {
      task.description = "running the second task";
    });
  });

  root.add(section => {
    section.description = "showing the second section";

    section.add(task => {
      task.description = "running the third task";
    });

    section.add(task => {
      task.description = "running the lengthy fourth task";

      task.run = () => new Promise((resolve, reject) => {
        task.log("warn",
                 "This fourth task takes a full 1/10 second ...");
        setTimeout(() => {
          resolve();
        }, 100);
      });
    });

    section.add(task => {
      task.description = "running the fifth task";
    });
  });
});
