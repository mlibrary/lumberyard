.PHONY: spec test

spec:
	bundle exec rspec -f documentation spec

test:
	bundle exec rspec spec
