compile:
	./node_modules/coffee-script/bin/coffee -bw -o ./lib -c ./src

test-casper:
	casperjs test ./test
