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

  let index = template.search("mm");

  if (index === -1)
    return prefix + template;

  prefix += template.slice(0, index) + pad(now.getMonth() + 1);
  template = template.slice(index + 2);
  index = template.search("dd");

  if (index === -1)
    return prefix + template;

  prefix += template.slice(0, index) + pad(now.getDate());
  template = template.slice(index + 2);
  index = template.search("HH");

  if (index === -1)
    return prefix + template;

  prefix += template.slice(0, index) + pad(now.getHours());
  template = template.slice(index + 2);
  index = template.search("MM");

  if (index === -1)
    return prefix + template;

  prefix += template.slice(0, index) + pad(now.getMinutes());
  template = template.slice(index + 2);
  index = template.search("SS");

  if (index === -1)
    return prefix + template;

  prefix += template.slice(0, index) + pad(now.getSeconds());
  template = template.slice(index + 2);

  return prefix + template;
};
