// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (setUp) => new Promise(
    function(resolve, reject) {
  let node = {};
  let obj = {};
  let children = [];

  obj.runBefore = () => {};
  obj.run = () => {};
  obj.runAfter = () => {};

  obj.add = function(childSetUp) {
    children.push(treeNode(childSetUp))
  };

  node.run = logger => new Promise(function(resolveRun, rejectRun) {
    obj.log = (code, message) => new Promise(
        function(resolveLog, rejectLog) {
      try {
        logger.log([Date.now(), code, message]);
        resolveLog();
      }

      catch (e){
        rejectLog(e);
      }
    });

    obj.log("begin");

    Promise.resolve(obj.runBefore()).then(function() {
      Promise.resolve(obj.run()).then(function() {
        let runningChildren = [];
        for (let child of node.children)
          runningChildren.push(child.run(logger));

        Promise.all(runningChildren).then(function() {
          Promise.resolve(obj.runAfter()).then(function() {
            obj.log("done");
            resolveRun();
          });
        });
      });
    });
  });

  Promise.resolve(setUp(obj)).then(function(value) {
    Promise.all(children).then(function(childIterator) {
      node.children = [...childIterator];
      resolve(node);
    });
  });
});

let newRootNode = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  let rootPromise = treeNode(setUp);
  let logger = newLogger({});

  rootPromise.then(function(root) {
    logger.storeProcess(root.run(logger));
    resolve(logger);
  });
});

module.exports = newRootNode;
