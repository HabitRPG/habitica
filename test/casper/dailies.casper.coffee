helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# ---------- Daily ------------
casper.then ->
  helpers.reset()
  helpers.addTasks()

# Gained exp on +daily
casper.then ->
  helpers.modelBeforeAfter (-> casper.click '.dailys input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '+daily =hp'
    casper.test.assert model.before._user.stats.exp < model.after._user.stats.exp, '+daily +exp'
    casper.test.assert model.before._user.stats.gp < model.after._user.stats.gp, '+daily +gp'

# -daily acts as undo
casper.then ->
  helpers.modelBeforeAfter (-> casper.click '.dailys input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '-daily =hp'
    casper.test.assert model.before._user.stats.exp > model.after._user.stats.exp, '-daily -exp'
    casper.test.assert model.before._user.stats.gp > model.after._user.stats.gp, '-daily -gp'

# ---------- Cron ------------
casper.then ->
  helpers.reset()
  helpers.addTasks()

casper.then ->
  helpers.cronBeforeAfter (model) ->
    casper.then ->
      #TODO make sure true for all dailies
      dailyId = model.before._user.dailyIds[0]
      casper.test.assert model.before._user.tasks[dailyId].value < model.after._user.tasks[dailyId].value, "daily:cron:daily gained value"
      casper.test.assert model.before._user.stats.hp < model.after._user.stats.hp, 'daily:cron:hp lost value'

# ---------- Run ------------
casper.run ->
  @test.renderResults true