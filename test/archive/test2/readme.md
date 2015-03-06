1) It is a bit verbose
2) It needs to be refactored using "async" library. Somehow casper.then() is introducing bugs so I'm not going to use it until I figure out why exactly. Leave it as it is, I'll refactor as it grows.
3) It does not use any timeouts along the way, which is a good thing.
4) It runs consistently on my side (i.e. always passes).
5) So far phantomJS is given new userID every time so app.reset,app.revive is not necessary. I'll add it later.

To run the tests run from terminal:
cd test/test2
casperjs test ./casper/ --includes=./lib/helpers.coffee