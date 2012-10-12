compile:
	./node_modules/coffee-script/bin/coffee -bw -o ./lib -c ./src

MOCHA_TESTS := $(shell find test/ -name '*.mocha.*')
MOCHA = mocha --compilers coffee:coffee-script
OUT_FILE = "test-output.tmp"

g = "."

test-mocha:
	@NODE_ENV=test $(MOCHA) --grep "$(g)" $(MOCHA_TESTS)
	#@NODE_ENV=test $(MOCHA) --grep "$(g)" $(MOCHA_TESTS) | tee $(OUT_FILE)

test-casper:
	casperjs test ./test/rest.casper.coffee

test!:
	@perl -n -e '/\[31m  0\) (.*?).\[0m/ && print "make test g=\"$$1\$$\""' $(OUT_FILE) | sh
