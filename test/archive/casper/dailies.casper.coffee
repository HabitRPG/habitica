helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# ---------- Daily ------------
casper.then ->
  helpers.reset()
  helpers.addTasks(['daily'])

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
  helpers.addTasks(['daily'])

casper.then ->
  helpers.cronBeforeAfter (model) ->
    casper.then ->
      casper.test.assert model.before._user.stats.hp > model.after._user.stats.hp, 'daily:cron:hp lost value'

      # Go through all the dailys, all of them are uncompleted, so should all get a negative value
      casper.echo "Testing all uncompleted dailys after cron"
      for id in model.before._user.dailyIds
        casper.test.assertEquals model.before._user.tasks[id].value, 0, "daily:cron:daily value before was 0"
        casper.test.assert model.after._user.tasks[id].value < 0, "daily:cron:daily value after is negative"

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true