#helpers = new require('./lib/helpers')()
#casper = helpers.casper
helpers = casper.helpers
# ---------- Checks if clicking on the buttons changes stats and in right direction ------------

#click .habits "+" and see if GP and XP are going up.
casper.start helpers.playUrl, ->
  helpers.getModel (err, model) ->
    casper.test.assertEquals(typeof model.user.stats.exp, "number", 'XP is number')
    casper.test.assertEquals(model.user.stats.exp, 0, 'XP == 0')
    casper.click '.habits a[data-direction="up"]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.exp > model.user.stats.exp, 'XP has increased after clicking habits "+"')
      casper.test.assert(newModel.user.stats.gp > model.user.stats.gp, 'GP has increased after clicking habits "+"')

#click .habits "-" and see if HP is going down
casper.then ->
  helpers.getModel (err, model) ->
    casper.test.assertEquals(typeof model.user.stats.hp, "number", 'HP is number')
    casper.test.assertEquals(model.user.stats.hp, 50, 'HP == 50')
    casper.click '.habits a[data-direction="down"]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.hp < model.user.stats.hp, 'HP has decreased after clicking habits "-"')

#click .todo.uncompleted and see if GP and XP are going up.
casper.then ->
  helpers.getModel (err, model) ->
    casper.click '.task.todo.uncompleted input[type=checkbox]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.exp > model.user.stats.exp, 'XP has increased after checking uncompleted todo')
      casper.test.assert(newModel.user.stats.gp > model.user.stats.gp, 'GP has increased after checking uncompleted todo')


#click .todo.completed and see if GP and XP are going down.
casper.then ->
  helpers.getModel (err, model) ->
    casper.click '.task.todo.completed input[type=checkbox]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.exp < model.user.stats.exp, 'XP has increased after unchecking completed todo')
      casper.test.assert(newModel.user.stats.gp < model.user.stats.gp, 'GP has increased after unchecking completed todo')

#click .daily.uncompleted and see if GP and XP are going up.
casper.then ->
  helpers.getModel (err, model) ->
    casper.click '.task.daily.uncompleted input[type=checkbox]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.exp > model.user.stats.exp, 'XP has increased after checking uncompleted daliy')
      casper.test.assert(newModel.user.stats.gp > model.user.stats.gp, 'GP has increased after checking uncompleted daliy')


#click .daily.completed and see if GP and XP are going down.
casper.then ->
  helpers.getModel (err, model) ->
    casper.click '.task.daily.completed input[type=checkbox]'
    helpers.getModel (err, newModel) ->
      casper.test.assert(newModel.user.stats.exp < model.user.stats.exp, 'XP has increased after unchecking completed daliy')
      casper.test.assert(newModel.user.stats.gp < model.user.stats.gp, 'GP has increased after unchecking completed daliy')


# ---------- finish tests ------------
casper.then ->
  casper.test.done()





# ---------- Run ------------
casper.run ->
  casper.test.renderResults true