// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolveNode, rejectNode) {
  let node = {};
  let payload = {};
  let children = [];

  payload.runBefore = () => {};
  payload.run = () => {};
  payload.runAfter = () => {};

  payload.add = function(childSetUp) {
    children.push(treeNode(address.concat(children.length),
                           childSetUp))
  };

  node.run = logger => new Promise(function(resolveRun, rejectRun) {
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
      for (let child of node.children)
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
    return Promise.all(children);

  }).then(function(childIterator) {
    node.children = [...childIterator];
    node.getLogTree = function() {
      let result = {};

      if (payload.description)
        result.d = payload.description;

      result.c = [];
      for (let leaf of node.children)
        result.c.push(leaf.getLogTree());

      return result;
    };

    resolveNode(node);
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
