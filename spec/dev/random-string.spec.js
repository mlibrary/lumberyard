// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

/* eslint-env mocha */
const expect = require("chai").expect;

const randomString = require("../../lib/random-string");
const pad = require("../../lib/pad");

describe("the randomString() function", () => {
  it("returns a six-character string by default", () => {
    expect(randomString()).to.have.lengthOf(6);
  });

  it("returns different strings", () => {
    let results = new Set();

    for (let i = 0; i < 100; i += 1)
      results.add(randomString());

    expect(results.size).to.be.above(1);
  });

  it("returns an eight-character string when given XXXXXXXX", () => {
    expect(randomString("XXXXXXXX")).to.have.lengthOf(8);
  });

  it("returns a four-character string when given XXXX", () => {
    expect(randomString("XXXX")).to.have.lengthOf(4);
  });

  it("leaves the prefix alone when given hey-XXXX", () => {
    expect(randomString("hey-XXXX")).to.match(/^hey-....$/);
  });

  it("returns the input when given no Xs", () => {
    expect(randomString("sup-friend")).to.equal("sup-friend");
  });

  it("returns the ingut when given XXX", () => {
    expect(randomString("XXX")).to.equal("XXX");
  });

  it("leaves suffixes alone", () => {
    expect(randomString("XXXX-what")).to.match(/^....-what$/);
  });

  it("can fill in multiple blank areas", () => {
    expect(randomString("XXXX-XXXX")).to.match(/^....-....$/);
    expect(randomString("XXXX-XXXX").slice(0, 4)).not.to.equal("XXXX");
    expect(randomString("XXXX-XXXX").slice(5)).not.to.equal("XXXX");
  });

  it("replaces YYYY with the year", () => {
    expect(randomString("yyyYYYYyyy")).to.equal(
      "yyy" + (new Date()).getFullYear() + "yyy");
  });

  it("ignores YYYY in the presence of XXXX", () => {
    expect(randomString("YYYYXXXX")).to.match(/^YYYY/);
    expect(randomString("XXXXYYYY")).to.match(/YYYY$/);
  });

  it("only replaces the last YYYY in the string", () => {
    expect(randomString("YYYY-YYYY-YYYY")).to.match(/^YYYY-YYYY-/);
  });

  it("looks for mm after YYYY", () => {
    let now = new Date();
    let yyyymm = now.getFullYear().toString();
    yyyymm += pad(now.getMonth() + 1);

    expect(randomString("hey-mm-YYYYmm-mm")).to.equal(
      "hey-mm-" + yyyymm + "-mm");
  });

  it("recognizes all of YYYYmmddHHMMSS", () => {
    expect(randomString("YYYYmmddHHMMSS")).to.match(/^[0-9]{14}$/);
  });

  it("stops after dd in YYYYmmddHMMSS", () => {
    expect(randomString("YYYYmmddHMMSS")).to.match(/^[0-9]{8}HMMSS$/);
  });

  it("reaches dd in YYYYmmHHMMSSddHH", () => {
    expect(randomString("YYYYmmHHMMSSddHH")).to.match(
      /^[0-9]{6}HHMMSS[0-9]{4}$/);
  });
});
