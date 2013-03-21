helpers = new require('./lib/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

# ---------- Basic Test ------------
casper.start url, ->
  casper.test.assertTitle 'HabitRPG | Gamify Your Life', 'Page Title'  
  casper.echo 'aaa'


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true