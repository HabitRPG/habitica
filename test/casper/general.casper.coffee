helpers = require('./helpers')
casper = helpers.casper
utils = helpers.utils
url = helpers.url

# ---------- Init ------------

casper.start url, ->
  @test.assertTitle "HabitRPG | Gamify Your Life", "[√] Page Title"

# ---------- Reset ------------
#  @then ->
#   utils.dump @evaluate -> window.DERBY.app.model.get('_user.auth')
#   @click '#reset-modal button:contains(Reset)'

# Clear tasks
casper.then ->
  #TODO test after stats have been modified
  casper.repeat 5, -> @click '.habits a[data-direction="down"]'
  casper.repeat 5, -> @click '.habits a[data-direction="up"]'
  userObj = @evaluate ->
    window.DERBY.app.reset()
    return window.DERBY.app.model.get('_user')

  @test.assertEqual userObj.tasks.length, 0
  @test.assertEqual userObj.stats.hp, 50

# ---------- Misc Pages ------------

casper.thenOpen "#{url}/terms", ->
  @test.assertTitle "Terms Of Use", "terms page works"

casper.thenOpen "#{url}/privacy", ->
  @test.assertTitle "Privacy Policy", "privacy page works"

# ---------- Run ------------
casper.run ->
  @test.renderResults true