// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let processTree = (newLogger, setUp) => new Promise(
    function(resolve, reject) {
  treeNode([], setUp).then(function(root) {
    let logger = newLogger(root.getLogTree());
    logger.storeProcess(root.run(logger));

    resolve(logger);

  }, passError(reject));
});

let treeNode = (address, setUp) => new Promise(
    function(resolve, reject) {
  let payload = {};
  let internal = {
    'address':address,
    'resolve':resolve,
    'reject':reject,
    'setUp':setUp
  };

  initInternal(internal, payload);
  initPayload(internal, payload);
  createRunMethod(internal, payload);
  attemptSetUp(internal, payload);
});

let initInternal = function(internal, payload) {
  internal.runnableNode = {};
  internal.errors = [];
  internal.children = [];
  internal.setPayloadLogger = function(logger) {
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

let createRunMethod = function(internal, payload) {
  internal.runnableNode.run = logger => new Promise(
      function(resolve, reject) {
    internal.setPayloadLogger(logger);
    payload.log("begin");

    let errors = [];
    let runningChildren = [];

    let errorOutWithChildren = function(children) {
      reject({
        "description": payload.description,
        "messages": errors,
        "children": children
      });
    };

    let errorOutWithMessage = function (message) {
      errors.push(message);
      errorOutWithChildren([]);
    };

    runAndWait(payload.runBefore).then(function() {
      runAndWait(payload.run).then(function() {
        for (let child of internal.runnableNode.children)
          runningChildren.push(child.run(logger));

        awaitOrCollectAllErrors(runningChildren).then(function() {
          runAndWait(payload.runAfter).then(function() {
            payload.log("done");
            resolve();

          }, errorOutWithMessage);
        }, errorOutWithChildren);
      }, errorOutWithMessage);
    }, errorOutWithMessage);
  });
};

let attemptSetUp = function(internal, payload) {
  let errorOut = function(children) {
    internal.reject({
      "description": payload.description,
      "messages": internal.errors,
      "children": children
    });
  };

  runAndWait(function() {
    internal.setUp(payload);

  }).then(function() {
    return awaitOrCollectAllErrors(internal.children);

  }, function(error) {
    internal.errors.push(error);
    return awaitOrCollectAllErrors(internal.children);

  }).then(function(childIterator) {
    if (internal.errors.length > 0)
      errorOut([]);

    else {
      internal.runnableNode.children = [...childIterator];
      resolveWithRunnableNode(internal, payload);
    }

  }, errorOut);
};

let resolveWithRunnableNode = function(internal, payload) {
  internal.runnableNode.getLogTree = function() {
    let result = {};

    if (payload.description)
      result.d = payload.description;

    result.c = [];
    for (let leaf of internal.runnableNode.children)
      result.c.push(leaf.getLogTree());

    return result;
  };

  internal.resolve(internal.runnableNode);
};

let awaitOrCollectAllErrors = promises => new Promise(
    function(resolve, reject) {
  Promise.all(promises).then(function(value) { resolve(value); },
    function(anError) {
      Promise.all(getListOfErrorPromises(promises)).then(
          rejectWithOrderedListOfErrors(reject));
    });
});

let getListOfErrorPromises = function(promises) {
  let errorPromises = [];

  for (let promise of promises) {
    errorPromises.push(new Promise(function(alwaysSucceed) {
      promise.then(function(value) {
        alwaysSucceed(null);

      }, function(error) {
        alwaysSucceed(error);
      });
    }));
  }

  return errorPromises;
};

let rejectWithOrderedListOfErrors = function(rejectMethod) {
  return function(errorValues) {
    let allErrors = [];

    for (let errorValue of errorValues) {
      if (errorValue !== null)
        allErrors.push(errorValue);
    }

    rejectMethod(allErrors);
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

module.exports = processTree;
