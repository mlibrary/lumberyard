// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolveNode, rejectNode) {
  let internal = {'address':address};
  let payload = {};
  let runnableNode = {};

  initInternal(internal, payload);
  initPayload(internal, payload);

  runnableNode.run = logger => new Promise(
      function(resolveRun, rejectRun) {
    internal.addLogger(logger);
    payload.log("begin");

    let runningChildren = [];
    let throwError = function(childErrors) {
      rejectRun({
        description: payload.description,
        children: childErrors,
        messages: []
      });
    };

    Promise.resolve(payload.runBefore()).then(function() {
      return Promise.resolve(payload.run());

    }, function(error) {
      rejectRun();

    }).then(function() {
      for (let child of runnableNode.children)
        runningChildren.push(child.run(logger));

      return Promise.all(runningChildren);

    }, function(error) {
      throwError();

    }).then(function() {
      return Promise.resolve(payload.runAfter()).then(function() {
        payload.log("done");
        resolveRun();

      }, function(error) {
        rejectRun();
      });

    }, function(error) {
      let errorResolutions = [];
      let childErrors = [];

      for (let child of runningChildren) {
        errorResolutions.push(new Promise(function(resolveError) {
          child.then(function(value) {
            resolveError();
          }, function(childError) {
            childErrors.push(childError);
            resolveError();
          });
        }));
      }

      Promise.all(errorResolutions).then(function(value) {
        throwError(childErrors);
      });
    });
  });

  runAndWait(function() { setUp(payload); }).then(function(value) {
    return Promise.all(internal.children);

  }, function(error) {
    internal.errors.push(error);
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

    if (internal.errors.length == 0)
      resolveNode(runnableNode);

    else
      rejectNode({
        description: payload.description,
        messages: internal.errors,
        children: []
      });

  }, function(error) {
    let errorResolutions = [];
    let childErrors = [];

    for (let child of internal.children) {
      errorResolutions.push(new Promise(function(resolveError) {
        child.then(function(value) {
          resolveError();
        }, function(childError) {
          childErrors.push(childError);
          resolveError();
        });
      }));
    }

    Promise.all(errorResolutions).then(function(value) {
      rejectNode({
        description: payload.description,
        messages: internal.errors,
        children: childErrors
      });
    });
  });
});

let initInternal = function(internal, payload) {
  internal.errors = [];
  internal.children = [];
  internal.addLogger = function(logger) {
    payload.log = newAddressedLogFunction(internal.address, logger);
  };
};

let initPayload = function(internal, payload) {
  payload.runBefore = () => {};
  payload.run = () => {};
  payload.runAfter = () => {};
  payload.add = function(childSetUp) {
    internal.children.push(
      treeNode(internal.address.concat(internal.children.length),
               childSetUp))
  };
};

let newAddressedLogFunction = (address, logger) =>
  (code, message) => new Promise((resolve, reject) => {
    let fullMessage = [Date.now(), code].concat(address);
    fullMessage.push(message || "");

    Promise.resolve(logger.log(fullMessage)).then(value => {
      resolve(value);
    }, passError(reject));
});

let passError = function(reject) {
  return function(error) {
    reject(error);
  };
};

let runAndWait = function(thingToRun) {
  try {
    return Promise.resolve(thingToRun());

  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  treeNode([], setUp).then(function(root) {
    let logger = newLogger(root.getLogTree());
    logger.storeProcess(root.run(logger));

    resolve(logger);

  }, passError(reject));
});
