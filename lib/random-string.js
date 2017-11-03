// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const blankChars = /X+/;

module.exports = function(template) {
  if (typeof template === "undefined")
    template = "XXXXXX";

  let result = "";
  let index = template.search(blankChars);

  if (index !== -1) {
    result += template.slice(0, index);
    let length = template.match(blankChars)[0].length
    result += getRandomCharacters(length);
    template = template.slice(index + length);
  };

  return result + template;
};

const getRandomCharacters = length => {
  let result = "";

  for (let i = 0; i < length; i += 1)
    result += getRandomCharacter();

  return result;
};

const b58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const getRandomCharacter = () => b58[Math.floor(Math.random() * 58)];
