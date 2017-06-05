// Copyright (c) 2017 The Regents of the University of Michigan.
// All Rights Reserved. Licensed according to the terms of the Revised
// BSD License. See LICENSE.txt for details.

const log_tree = require("../lib/log_tree");

describe("a log_tree object", function() {
  var tree;

  describe("when created from nothing", function() {
    beforeEach(function() {
      tree = log_tree();
    });

    it("has a length of 0", function() {
      expect(tree.length).toBe(0);
    });

    it("is not complete", function() {
      expect(tree.is_complete).toBe(false);
    });

    it("has a name of ''", function() {
      expect(tree.name).toBe("");
    });

    it("exports to {name:'',children:[]}", function() {
      expect(tree.export()).toEqual({name: "", children: []});
    });

    it("doesn't remember a length change", function() {
      tree.length = 1;
      expect(tree.length).toBe(0);
    });

    it("accepts alternative is_complete values", function() {
      tree.is_complete = true;
      expect(tree.is_complete).toBe(true);
    });

    describe("when its name is set to 'matt'", function() {
      beforeEach(function() {
        tree.name = "matt";
      });

      it("has a name of 'matt'", function() {
        expect(tree.name).toBe("matt");
      });

      it("exports to {name:'matt',children:[]}", function() {
        expect(tree.export()).toEqual({name: "matt", children: []});
      });
    });
  });

  describe("when created with 'name'", function() {
    beforeEach(function() {
      tree = log_tree("name");
    });

    it("remembers its name", function() {
      expect(tree.name).toBe("name");
    });

    it("has a length of 0", function() {
      expect(tree.length).toBe(0);
    });

    it("exports to {name:'name',children:[]}", function() {
      expect(tree.export()).toEqual({name: "name", children: []});
    });

    it("remembers a name change", function() {
      tree.name = "beremy";
      expect(tree.name).toBe("beremy");
    });
  });
});
