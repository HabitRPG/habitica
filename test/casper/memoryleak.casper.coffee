helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

casper.repeat 100, ->
  casper.reload()

casper.run ->
  casper.test.renderResults true