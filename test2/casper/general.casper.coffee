helpers = new require('./lib/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.on('remote.message'
           (msg) ->
             this.echo '[Console] : ' + msg
         )

# ---------- Basic Test ------------
casper.start url, ->
  casper.test.assertTitle 'HabitRPG | Gamify Your Life', 'Page Title'
  helpers.getModel (res) ->
    casper.echo '...model received.'
    casper.test.assertEquals(typeof res.stats.exp,"number",'experience is number')
    casper.test.assertEquals(typeof res.stats.exp,0,'experience == 0')


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true