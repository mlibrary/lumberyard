// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = (newLogger, setUp) => new Promise(
    function(resolvePreprocess, rejectPreprocess) {
  let obj = {
    runBefore: () => {},
    run: () => {},
    runAfter: () => {}
  };

  let add_counter = 0;
  obj.add = function() {
    add_counter += 1;
  };

  Promise.resolve(setUp(obj));

  let logger = newLogger({});
  obj.log = (code, message) => new Promise(
      function(resolveLog, rejectLog) {
    logger.log([Date.now(), code, message]);
    resolveLog();
  });

  logger.storeProcess(new Promise(
      function(resolveProcess, rejectProcess) {
    obj.log("begin");
    Promise.resolve(obj.run()).then(function(value) {
      Promise.resolve(obj.runBefore()).then(function(value) {
        Promise.resolve(obj.runAfter()).then(function(value) {
          logger.log();
          resolveProcess();
        });
      });
    });
  }));

  for (let i = 0; i < add_counter; i += 1) {
    logger.log();
    logger.log();
  }

  resolvePreprocess(logger);
});
