// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolve, reject) {
  let node = {};
  let obj = {};
  let children = [];

  obj.runBefore = () => {};
  obj.run = () => {};
  obj.runAfter = () => {};

  obj.add = function(childSetUp) {
    children.push(treeNode(address.concat(children.length),
                           childSetUp))
  };

  node.run = logger => new Promise(function(resolveRun, rejectRun) {
    obj.log = (code, message) => new Promise(
        function(resolveLog, rejectLog) {
      let a = [Date.now(), code].concat(address);
      a.push(message || "");

      Promise.resolve(
        logger.log(a)

      ).then(value => {
        resolveLog(value);
      });
    });

    obj.log("begin");

    Promise.resolve(obj.runBefore()).then(function() {
      return Promise.resolve(obj.run());

    }).then(function() {
      let runningChildren = [];
      for (let child of node.children)
        runningChildren.push(child.run(logger));

      return Promise.all(runningChildren);

    }).then(function() {
      return Promise.resolve(obj.runAfter());

    }).then(function() {
      obj.log("done");
      resolveRun();
    });
  });

  Promise.resolve(setUp(obj)).then(function(value) {
    node.getLogTree = function() {
      let result = {};

      if (obj.description)
        result.d = obj.description;

      return result;
    };

    return Promise.all(children);

  }).then(function(childIterator) {
    node.children = [...childIterator];
    resolve(node);
  });
});

let newRootNode = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  treeNode([], setUp).then(function(root) {
    let logger = newLogger(root.getLogTree());
    logger.storeProcess(root.run(logger));

    resolve(logger);
  });
});

module.exports = newRootNode;
