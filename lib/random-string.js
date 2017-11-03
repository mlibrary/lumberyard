// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const pad = require("./pad");
const blankChars = /XXXX+/;

module.exports = template => {
  if (typeof template === "undefined")
    template = "XXXXXX";

  if (blankChars.test(template))
    return splitTemplate(template).join("");

  else
    return checkForDate(template);
};

const splitTemplate = template => {
  result = [];

  let index = template.search(blankChars);

  while (index !== -1) {
    result.push(template.slice(0, index));

    let length = template.match(blankChars)[0].length;
    result.push(getRandomCharacters(length));

    template = template.slice(index + length);
    index = template.search(blankChars);
  }

  result.push(template);
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

const checkForDate = template => {
  let nonYYYY = template.split("YYYY");
  if (nonYYYY.length === 1)
    return template;

  let now = new Date();

  template = now.getFullYear() + nonYYYY.pop();
  let prefix = nonYYYY.join("YYYY");

  return prefix + fillInDate(template, now);
};

const fillInDate = (template, now) => {
  if (!/mm/.test(template))
    return template;

  template = template.replace("mm", pad(now.getMonth() + 1));

  return template;
};
