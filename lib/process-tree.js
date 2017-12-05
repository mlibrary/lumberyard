// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const TreeError = function(description, messages, children) {
  const error = new Error();
  error.description = description;
  error.messages = messages;
  error.children = children;

  return error;
};

const processTree = (newLogger, setUp) => {
  return new Promise(function(resolve, reject) {
    treeNode([], setUp).then(function(runnableNode) {
      const logger = newLogger(runnableNode.getLogTree());

      logger.storeProcess(runnableNode.run(logger));

      resolve(logger);
    }, reject);
  });
};

const treeNode = (address, setUp) => {
  return new Promise(function(resolve, reject) {
    const payload = {};
    const internal = {
      "address": address,
      "resolve": resolve,
      "reject": reject,
      "setUp": setUp
    };

    initInternal(internal, payload);
    initPayload(internal, payload);
    createRunMethod(internal, payload);
    attemptSetUp(internal, payload);
  });
};

const initInternal = function(internal, payload) {
  internal.runnableNode = {};
  internal.errors = [];
  internal.children = [];

  internal.appendChild = function(childSetUpFunction) {
    internal.children.push(treeNode(internal.generateNewChildAddress(),
                                    childSetUpFunction));
  };

  internal.generateNewChildAddress = function() {
    return internal.address.concat(internal.children.length);
  };

  internal.definePayloadLogFunction = function(logger) {
    payload.log = function(code, message) {
      return logger.log(internal.buildMessageObject(code, message));
    };
  };

  internal.buildMessageObject = function(code, message) {
    const fullMessage = [Date.now(), code].concat(internal.address);

    fullMessage.push(message || "");

    return fullMessage;
  };
};

const initPayload = function(internal, payload) {
  payload.runBefore = () => {};
  payload.run = () => {};
  payload.runAfter = () => {};

  payload.log = () => {};
  payload.add = internal.appendChild;
};

const createRunMethod = function(internal, payload) {
  internal.runnableNode.run = logger => {
    return new Promise(function(resolve, reject) {
      internal.definePayloadLogFunction(logger);
      payload.log("begin");

      const errors = [];
      const runningChildren = [];

      const errorOutWithMessage = function(message) {
        errors.push(message);
        errorOutWithChildren([]);
      };

      const errorOutWithChildren = function(children) {
        reject(TreeError(payload.description, errors, children));
      };

      runAndWait(payload.runBefore).then(function() {
        runAndWait(payload.run).then(function() {
          for (const child of internal.runnableNode.children)
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
};

const attemptSetUp = function(internal, payload) {
  const errorOut = function(children) {
    internal.reject(TreeError(payload.description,
                              internal.errors,
                              children));
  };

  runAndWait(function() {
    return internal.setUp(payload);
  }).then(function() {
    return awaitOrCollectAllErrors(internal.children);
  }, function(error) {
    internal.errors.push(error);
    return awaitOrCollectAllErrors(internal.children);
  }).then(function(childIterator) {
    if (internal.errors.length > 0) {
      errorOut([]);
    } else {
      internal.runnableNode.children = [...childIterator];
      resolveWithRunnableNode(internal, payload);
    }
  }, errorOut);
};

const resolveWithRunnableNode = function(internal, payload) {
  internal.runnableNode.getLogTree = function() {
    const result = {};

    if (payload.description)
      result.d = payload.description;

    result.c = [];
    for (const leaf of internal.runnableNode.children)
      result.c.push(leaf.getLogTree());

    return result;
  };

  internal.resolve(internal.runnableNode);
};

const awaitOrCollectAllErrors = promises => {
  return new Promise(function(resolve, reject) {
    Promise.all(promises).then(function(value) {
      resolve(value);
    }, function() {
      Promise.all(getListOfErrorPromises(promises)).then(
        rejectWithOrderedListOfErrors(reject));
    });
  });
};

const getListOfErrorPromises = function(promises) {
  const errorPromises = [];

  for (const promise of promises)
    errorPromises.push(new Promise(function(resolve) {
      promise.then(function(value) {
        resolve(null);
      }, function(error) {
        resolve(error);
      });
    }));

  return errorPromises;
};

const rejectWithOrderedListOfErrors = function(rejectMethod) {
  return function(errorValues) {
    const allErrors = [];

    for (const errorValue of errorValues)
      if (errorValue !== null)
        allErrors.push(errorValue);

    rejectMethod(allErrors);
  };
};

const runAndWait = function(thingToRun) {
  try {
    return Promise.resolve(thingToRun());
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = processTree;
