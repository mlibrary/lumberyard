Lumberyard
==========

[![NPM Version][npm-image]][npm]
[![Build Status][status-image]][travis]
[![Test Coverage][cover-image]][coverage]

You can clone this repository and use relative `require` statements, or
you can just install it through npm:

```bash session
$ npm install lumberyard
```

And then you can use it the regular way:

```javascript
const Lumberyard = require("lumberyard");
```

It's got a few things you can use.

```javascript
Lumberyard.Scheduler
Lumberyard.ProcessTree
Lumberyard.LogTree
Lumberyard.tempName
```

Scheduler
---------

First, you need to define a task.

```javascript
let tasks = {};
tasks.example = {};

// One function should look for files/directories to process and resolve
// with a list of them. If no files are present at the moment, it should
// resolve with an empty list.
tasks.example.find = () => new Promise((resolve, reject) => {
  // ...
  resolve([...]);
});

// This will be run with the output from the previous promise once we're
// sure all appropriate files have finished copying.
tasks.example.move = filesToMove => new Promise((resolve, reject) => {
  // make a new working directory
  // move all files in the list into there
  resolve(newWorkingDir);
});

tasks.example.run = workingDir => Promise((resolve, reject) => {
  // whatever you wanted to do goes here
});
```

You can define additional tasks by adding them as keys on the initial
`tasks` object you define. Once done, run `Scheduler()` with them.

```javascript
Lumberyard.Scheduler(tasks); // returns a new promise
```

The scheduler will run the `find()` methods on each task you define. If
it finds no files, it'll exit.

If it finds files related to any task, it'll start keeping an eye on
them until it's certain they're finished copying. Then it'll run your
`move()` and `run()` methods.

While any processes are running, we'll continue running `find()` on
other tasks until all processes are done.

ProcessTree and LogTree
-----------------------

Process trees are designed for cases where you want to validate and
process trees of things. For example, you might have shipment folders
full of volume folders full of images which need to be converted in some
way. You also might want to validate the input to some degree before
doing any actual processing.

Here's a file tree example:

```
./
|-- Shipment_1234567/
|   |-- Volume_001/
|   |   |-- 00000001.tif
|   |   |-- 00000002.tif
|   |   |-- 00000003.tif
|   |   \-- 00000004.tif
|   |-- Volume_002/
|   |   |-- 00000001.tif
|   |   |-- 00000002.tif
|   |   |-- 00000003.tif
|   |   \-- 00000004.tif
|   \-- Volume_003/
|       |-- 00000001.tif
|       |-- 00000002.tif
|       |-- 00000003.tif
|       \-- 00000004.tif
\-- Shipment_1234568/
    |-- Volume_004/
    |   |-- 00000001.tif
    |   |-- 00000002.tif
    |   |-- 00000003.tif
    |   \-- 00000004.tif
    |-- Volume_005/
    |   |-- 00000001.tif
    |   |-- 00000002.tif
    |   |-- 00000003.tif
    |   \-- 00000004.tif
    \-- Volume_006/
        |-- 00000001.tif
        |-- 00000002.tif
        |-- 00000003.tif
        \-- 00000004.tif
```

To deal with this, you'd use ProcessTree like this:

```javascript
// getShipmentDirs, getVolumeDirs, and getPageImages are examples of
// helper methods you might define.

Lumberyard.ProcessTree(root => {
  for (let shipmentDir of getShipmentDirs(".")) {
    root.add(shipment => {
      shipment.description = shipmentDir; // useful for logging

      // validate the shipment structure; possibly throw errors

      for (let volumeDir of getVolumeDirs(shipmentDir)) {
        shipment.add(volume => {
          volume.description = volumeDir;

          // validate etc.

          for (let pageImage of getPageImages(volumeDir)) {
            volume.add(page => {
              page.description = pageImage;

              // validate etc.

              page.run = () => {
                // Put everything you want to do for each page in here.
                // It will only run if everything passes the validation
                // steps.
              };
            });
          }
        });
      }
    });
  }
});
```

You could (and proabably should) flatten something like this. If you
want volumes to execute their own code as well, it could look like this:

```javascript
volume.run = () => { ... };
```

More formally, `Lumberyard.ProcessTree()` takes two arguments:

1.  (optional) filename to write logging output to
2.  (required) the root validation function

If called with only one argument, it'll write its logging output to
stdout instead of to a file.

Validation functions that you write will be called with one argument,
which you can treat as a payload.

```javascript
Lumberyard.ProcessTree(payload => {
  payload.description = "this text will show up in logs"

  payload.add(child => {
    // This is how you add child nodes in the process tree. The single
    // argument in this method has all the same properties as payload,
    // but child will bind to this subprocess.
  });

  // These three run() methods are all optional:

  payload.run = () => {
    // Put action code for the node here. This method can also be
    // asynchronous if that's what you want.
  };

  payload.runBefore = () => {
    // If this node has children, this method will run before any
    // methods are run on any children.
  };

  payload.runAfter = () => {
    // If this node has children, this method will run after any and all
    // childrens' methods have completed successfully.
  };

  // These will all go to the log. They can also be run from inside any
  // of the run() methods.
  payload.log("info", "Some informational message");
  payload.log("warn", "Uh oh a warning; bad but not too bad");
  payload.log("error", "Error messages are as serious as it gets");

  // Feel free to set other keys in the payload to whatever you want.
  // Only description, add, run, runBefore, runAfter, and log have
  // special meaning.
  payload.flipflop = "blipblop";
});
```

tempName
--------

This is just a function that acts a lot like `mktemp`. You pass it a
template string, and it will convert any serieses of four or more `X`s
into random base-58 characters. Or, if you want to use a timestamp, you
can instead hand it `YYYYmmddHHMMSS`.


```javascript
Lumberyard.tempName();                      // "nSzZEw"
Lumberyard.tempName();                      // "HRepr6"
Lumberyard.tempName();                      // "f88ye8"
Lumberyard.tempName("XXXXXXXX");            // "3GLvJSy2"
Lumberyard.tempName("XXXX");                // "pNBS"
Lumberyard.tempName("XXX");                 // "XXX"
Lumberyard.tempName("helloXXXXbye");        // "hello4YV3bye"
Lumberyard.tempName("aXXXXbXXXXc");         // "adSPFbx5X7c"

Lumberyard.tempName("YYYY-mm-ddTHH:MM:SS")  // "2017-11-03T16:15:40"
Lumberyard.tempName("YYYYmmddHHMMSS")       // "20171103161540"
Lumberyard.tempName("hey-YYYYmmddHHMMSS")   // "hey-20171103161540"
Lumberyard.tempName("hey-YYYYmmdd")         // "hey-20171103"

Lumberyard.tempName("hey-YYYYmmdd-XXXX")    // "hey-YYYYmmdd-pcX8"
```

[travis]:       https://travis-ci.org/mlibrary/lumberyard
[status-image]: https://travis-ci.org/mlibrary/lumberyard.svg?branch=master
[npm]:          https://www.npmjs.com/package/lumberyard
[npm-image]:    https://img.shields.io/npm/v/lumberyard.svg
[coverage]:     https://coveralls.io/github/mlibrary/lumberyard
[cover-image]:  https://coveralls.io/repos/github/mlibrary/lumberyard/badge.svg?branch=master
