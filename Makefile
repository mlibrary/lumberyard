.PHONY: spec test

spec:
	npm test

test:
	npm run-script test:fast

coverage:
	npm run-script test:cover
	cat coverage/lcov.info | ./node_modules/.bin/coveralls
	rm -r coverage
