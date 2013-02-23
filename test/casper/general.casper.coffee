helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

# ---------- Basic Reset Test ------------

casper.start url, ->
  casper.test.assertTitle 'HabitRPG | Gamify Your Life', 'Page Title'

# Gain some GP and lose some HP
casper.then ->
  casper.repeat 5, -> casper.click '.habits a[data-direction="down"]'
  casper.repeat 5, -> casper.click '.habits a[data-direction="up"]'

# Reset
casper.then ->
  helpers.reset()

# Test that reset worked
casper.then ->
  model = helpers.getModelDelayed (model) ->
    casper.echo 'testing user after reset'
    casper.test.assertEqual model._user.tasks, {}, 'no tasks'
    casper.test.assertEqual model._user.stats, {hp:50, gp:0, exp:0, lvl:1}, 'stats'


# ---------- Misc Pages ------------

casper.thenOpen "#{helpers.baseUrl}/terms", ->
  casper.test.assertTitle "Terms Of Use", "terms page works"

casper.thenOpen "#{helpers.baseUrl}/privacy", ->
  casper.test.assertTitle "Privacy Policy", "privacy page works"

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true