// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolveNode, rejectNode) {
  let internal = {};
  let payload = {};
  let runnableNode = {};

  internal.children = [];
  internal.addLogger = function(logger) {
    payload.log = newAddressedLogFunction(address, logger);
  };

  payload.runBefore = () => {};
  payload.run = () => {};
  payload.runAfter = () => {};

  payload.add = function(childSetUp) {
    internal.children.push(
      treeNode(address.concat(internal.children.length),
               childSetUp))
  };

  runnableNode.run = logger => new Promise(
      function(resolveRun, rejectRun) {
    internal.addLogger(logger);
    payload.log("begin");

    Promise.resolve(payload.runBefore()).then(function() {
      return Promise.resolve(payload.run());

    }).then(function() {
      let runningChildren = [];
      for (let child of runnableNode.children)
        runningChildren.push(child.run(logger));

      return Promise.all(runningChildren);

    }).then(function() {
      return Promise.resolve(payload.runAfter());

    }).then(function() {
      payload.log("done");
      resolveRun();
    });
  });

  Promise.resolve(setUp(payload)).then(function(value) {
    return Promise.all(internal.children);

  }, function(error) {
    return Promise.all(internal.children);

  }).then(function(childIterator) {
    runnableNode.children = [...childIterator];
    runnableNode.getLogTree = function() {
      let result = {};

      if (payload.description)
        result.d = payload.description;

      result.c = [];
      for (let leaf of runnableNode.children)
        result.c.push(leaf.getLogTree());

      return result;
    };

    resolveNode(runnableNode);

  }, function(error) {
    rejectNode();
  });
});

let newAddressedLogFunction = (address, logger) =>
  (code, message) => new Promise((resolve, reject) => {
    let fullMessage = [Date.now(), code].concat(address);
    fullMessage.push(message || "");

    Promise.resolve(logger.log(fullMessage)).then(value => {
      resolve(value);
    });
});

module.exports = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  treeNode([], setUp).then(function(root) {
    let logger = newLogger(root.getLogTree());
    logger.storeProcess(root.run(logger));

    resolve(logger);

  }, function(error) {
    reject("oh no");
  });
});
