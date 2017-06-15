// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = (newLogger, setUp) => new Promise(
    function(resolvePreprocess, rejectPreprocess) {
  let obj = {
    add: () => {},
    run: () => {}
  };

  Promise.resolve(setUp(obj));

  let logger = newLogger({});

  logger.storeProcess(new Promise(
      function(resolveProcess, rejectProcess) {
    logger.log();
    Promise.resolve(obj.run()).then(function(value) {
      logger.log();
      resolveProcess();
    });
  }));

  resolvePreprocess(logger);
});
