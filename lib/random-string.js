// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

module.exports = function(template) {
  if (typeof template === "undefined")
    template = "XXXXXX";

  let result = "";
  let index = template.search(/X+/);

  if (index !== -1) {
    result += template.slice(0, index);
    result += getRandomCharacters(template.match(/X+/)[0].length);
  };

  return result;
};

const getRandomCharacters = length => {
  let result = "";

  for (let i = 0; i < length; i += 1)
    result += getRandomCharacter();

  return result;
};

const b58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const getRandomCharacter = () => b58[Math.floor(Math.random() * 58)];
