helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

# ---------- Register ------------
user = undefined
casper.then -> helper.register()
casper.then -> user = helper.getUser()
casper.then -> casper.reload()
casper.then ->
  nowUser = helper.getUser()
  casper.then ->
    casper.test.assertEqual user.id, nowUser.id, 'user registered and maintained session'

# ---------- Log Out ------------
casper.thenOpen helper.url + '/logout'
casper.thenOpen helper.url + '/?play=1'
casper.then ->
  nowUser = helper.getUser()
  casper.then ->
    casper.test.assertNotEquals user.id, nowUser.id, 'user logged out'

# ---------- Login ------------
casper.then -> helper.login()
casper.then -> utils.dump casper.debugHTML '#derby-auth-login'
casper.then ->
  nowUser = helper.getUser()
  casper.then ->
    casper.test.assertEqual user.id, nowUser.id, 'user logged in'

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true