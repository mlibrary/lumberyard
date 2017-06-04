.PHONY: spec test

spec:
	jasmine-node --verbose .

test:
	jasmine-node .
