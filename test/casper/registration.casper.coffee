helpers = require('./helpers')
casper = helpers.casper
utils = helpers.utils
url = helpers.url

# ---------- Register ------------
user = undefined
casper.then ->
  helpers.register()
casper.then -> user = helpers.getUser()
casper.then -> reload()
casper.then ->
  nowUser = getUser()
  casper.then ->
    casper.test.assertEqual user.id, nowUser.id, 'user registered and maintained session'

# ---------- Login ------------
#TODO logout
#TODO login
#TODO make sure same id

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true