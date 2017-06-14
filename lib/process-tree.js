// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = (newLogger) => new Promise((resolvePreprocess,
                                             rejectPreprocess) => {
  let logger = newLogger({});

  logger.storeProcess(new Promise((resolveProcess, rejectProcess) => {
    logger.log();
    logger.log();
    resolveProcess();
  }));

  resolvePreprocess(logger);
});
