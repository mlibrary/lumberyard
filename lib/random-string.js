// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function() {
  let result = "";

  for (let i = 0; i < 6; i += 1)
    result += getRandomCharacter();

  return result;
};

let b58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

let getRandomCharacter = () => b58[Math.floor(Math.random() * 58)];
