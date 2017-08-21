// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

let treeNode = (address, setUp) => new Promise(
    function(resolve, reject) {
  let payload = {};
  let runnableNode = {};
  let internal = {
    'address':address,
    'resolve':resolve,
    'reject':reject,
    'setUp':setUp
  };

  initInternal(internal, payload);
  initPayload(internal, payload);
  createRunMethod(internal, payload, runnableNode);
  attemptSetUp(internal, payload, runnableNode);
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

let createRunMethod = function(internal, payload, runnableNode) {
  runnableNode.run = logger => new Promise(function(resolve, reject) {
    internal.addLogger(logger);
    payload.log("begin");

    let runningChildren = [];
    let throwError = function(childErrors) {
      reject({
        description: payload.description,
        children: childErrors,
        messages: []
      });
    };

    Promise.resolve(payload.runBefore()).then(function() {
      return Promise.resolve(payload.run());

    }, function(error) {
      reject();

    }).then(function() {
      for (let child of runnableNode.children)
        runningChildren.push(child.run(logger));

      return Promise.all(runningChildren);

    }, function(error) {
      throwError();

    }).then(function() {
      return Promise.resolve(payload.runAfter()).then(function() {
        payload.log("done");
        resolve();

      }, function(error) {
        reject();
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
};

let attemptSetUp = function(internal, payload, runnableNode) {
  runAndWait(function() {
    internal.setUp(payload);

  }).then(function() {
    return awaitOrCollectAllErrors(internal.children);

  }, function(error) {
    internal.errors.push(error);
    return awaitOrCollectAllErrors(internal.children);

  }).then(function(childIterator) {
    if (internal.errors.length > 0)
      internal.reject({
        description: payload.description,
        messages: internal.errors,
        children: []
      });

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

    internal.resolve(runnableNode);

  }, function(error) {
    internal.reject({
      description: payload.description,
      messages: internal.errors,
      children: error
    });
  });
};

let awaitOrCollectAllErrors = promises => new Promise(
    function(resolve, reject) {
  Promise.all(promises).then(function(value) { resolve(value); },
    function(anError) {
      let errorPromises = getListOfErrorPromises(promises);

      Promise.all(errorPromises).then(function(errorValues) {
        let allErrors = [];

        for (let errorValue of errorValues) {
          if (errorValue !== null)
            allErrors.push(errorValue);
        }

        reject(allErrors);
      });
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
