.PHONY: spec test

spec:
	npm run lint
	npm test

test:
	npm run-script test:fast
	npm run lint

coverage:
	npm run lint
	npm run-script test:cover
	cat coverage/lcov.info | ./node_modules/.bin/coveralls
	rm -r coverage
