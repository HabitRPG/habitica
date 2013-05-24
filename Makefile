compile:
	./node_modules/browserify/bin/cmd.js -t coffeeify ./script/index.js > browser/browser.js
	./node_modules/browserify/bin/cmd.js -t coffeeify --debug ./script/index.js > browser/browser.debug.js