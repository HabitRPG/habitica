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
    utils.dump res._user.stats
  casper.echo 'aaa'


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true