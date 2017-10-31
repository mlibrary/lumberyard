MOCHA = ./node_modules/mocha/bin/mocha
.PHONY: spec test

spec:
	$(MOCHA) --recursive spec outerface

test:
	$(MOCHA) --recursive --reporter nyan spec
