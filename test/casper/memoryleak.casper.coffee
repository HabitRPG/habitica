helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

casper.repeat 50, ->
  casper.reload()

casper.run ->
  @test.renderResults true