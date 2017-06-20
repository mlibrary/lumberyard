// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolveNode, rejectNode) {
  let runnableNode = {};
  let payload = {};
  let internal = {};
  internal.children = [];

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
    payload.log = (code, message) => new Promise(
        function(resolveLog, rejectLog) {
      let a = [Date.now(), code].concat(address);
      a.push(message || "");

      Promise.resolve(
        logger.log(a)

      ).then(value => {
        resolveLog(value);
      });
    });

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
  });
});

module.exports = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  treeNode([], setUp).then(function(root) {
    let logger = newLogger(root.getLogTree());
    logger.storeProcess(root.run(logger));

    resolve(logger);
  });
});
