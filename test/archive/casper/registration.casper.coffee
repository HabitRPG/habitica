helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# ---------- Register ------------
registeredUser = undefined
casper.then -> helpers.register()
casper.then ->
  helpers.getModelDelayed (model) ->
    registeredUser = model

casper.then -> casper.reload()
casper.then ->
  helpers.getModelDelayed (nowModel) ->
    casper.test.assertEqual registeredUser._userId, nowModel._userId, 'user registered and maintained session'

# ---------- Log Out ------------
casper.thenOpen helpers.baseUrl + '/logout'
casper.thenOpen helpers.playUrl
casper.then ->
  helpers.getModelDelayed (nowModel) ->
    casper.test.assertNotEquals registeredUser._userId, nowModel._userId, 'user logged out'

# ---------- Login ------------
casper.then -> helpers.login()
casper.then ->
  helpers.getModelDelayed (nowModel) ->
    casper.test.assertEqual registeredUser._userId, nowModel._userId, 'user logged out'

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true