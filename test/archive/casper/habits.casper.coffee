helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# # ---------- Register ------------
# casper.then -> helpers.register()
# casper.then -> user = helpers.getUser()

# ---------- Habits ------------
casper.then ->
  helpers.reset()
  helpers.addTasks(['habit'])

casper.then ->
  helpers.modelBeforeAfter (-> casper.click '.habits a[data-direction="down"]'), (model) ->
    casper.test.assert model.before._user.stats.hp > model.after._user.stats.hp, '-habit -hp'
    casper.test.assertEquals model.before._user.stats.exp, model.after._user.stats.exp, '-habit =exp'
    casper.test.assertEquals model.before._user.stats.gp, model.after._user.stats.gp, '-habit =gp'

casper.then ->
  helpers.modelBeforeAfter (-> casper.click '.habits a[data-direction="up"]'), (model) ->
    casper.test.assert model.before._user.stats.exp < model.after._user.stats.exp, '+habit +exp'
    casper.test.assert model.before._user.stats.gp < model.after._user.stats.gp, '+habit +gp'
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '+habit =hp'

# Test Death
casper.then ->
  casper.repeat 50, (-> casper.click '.habits a[data-direction="down"]')
  casper.then ->
    helpers.getModelDelayed (model) ->
      casper.test.assertEquals model._user.stats.hp, 0, 'hp==0 (death by habits)'
      casper.test.assertEquals model._user.stats.lvl, 0, 'lvl==0 (death by habits)'
      casper.test.assertVisible '#dead-modal', 'Revive Modal Visible'

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true