.PHONY: spec test

spec:
	npm run lint
	npm run travis; rm -r coverage

test:
	npm run lint
	npm test
