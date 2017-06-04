.PHONY: spec test

spec:
	jasmine-node --verbose .

test:
	npm test
