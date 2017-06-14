// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = (newLogger) => new Promise((resolve, reject) => {
  let logger = newLogger({});

  logger.storeProcess(new Promise((good, bad) => {
    logger.log();
    logger.log();
    good();
  }));

  resolve(logger);
});
