#helpers = new require('./lib/helpers')()
#casper = helpers.casper
helpers = casper.helpers
eTest = helpers.evalTest
getModel = helpers.getModel
# ---------- Checks if clicking on the buttons changes stats and in right direction ------------


casper.start helpers.playUrl, ->
  test = 'EXP and GP increasing after clicking habits "+"'
  getModel (err, model) ->
    casper.test.assertEquals(typeof model.user.stats.exp, "number", 'XP is number')
    casper.test.assertEquals(model.user.stats.exp, 0, 'XP == 0')
    casper.click '.habits a[data-direction="up"]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.exp + "Is: " + stats.exp
             console.log "Was:" + oldStats.gp + "Is: " + stats.gp
             (stats.exp > oldStats.exp && stats.gp > oldStats.gp)
           test
           model.user.stats
         )


casper.then ->
  test = 'HP decreasing after clicking habits "-"'
  getModel (err, model) ->
    casper.click '.habits a[data-direction="down"]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.hp + "Is: " + stats.hp
             (stats.hp < oldStats.hp)
           test
           model.user.stats
         )

casper.then ->
  test = 'EXP and GP increasing after clicking .todo.uncompleted'
  getModel (err, model) ->
    casper.click '.task.todo.uncompleted input[type=checkbox]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.exp + "Is: " + stats.exp
             console.log "Was:" + oldStats.gp + "Is: " + stats.gp
             (stats.exp > oldStats.exp && stats.gp > oldStats.gp)
           test
           model.user.stats
         )

casper.then ->
  test = 'EXP and GP decreasing after clicking .todo.completed'
  getModel (err, model) ->
    casper.click '.task.todo.completed input[type=checkbox]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.exp + "Is: " + stats.exp
             console.log "Was:" + oldStats.gp + "Is: " + stats.gp
             (stats.exp < oldStats.exp && stats.gp < oldStats.gp)
           test
           model.user.stats
         )

casper.then ->
  test = 'EXP and GP increasing after clicking .daily.uncompleted'
  getModel (err, model) ->
    casper.click '.task.daily.uncompleted input[type=checkbox]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.exp + "Is: " + stats.exp
             console.log "Was:" + oldStats.gp + "Is: " + stats.gp
             (stats.exp > oldStats.exp && stats.gp > oldStats.gp)
           test
           model.user.stats
         )

casper.then ->
  test = 'EXP and GP decreasing after clicking .daily.completed'
  getModel (err, model) ->
    casper.click '.task.daily.completed input[type=checkbox]'
    eTest(
           (oldStats)->
             stats = window.DERBY.app.model.get '_user.stats'
             console.log "Was:" + oldStats.exp + "Is: " + stats.exp
             console.log "Was:" + oldStats.gp + "Is: " + stats.gp
             (stats.exp < oldStats.exp && stats.gp < oldStats.gp)
           test
           model.user.stats
         )


# ---------- finish tests ------------
casper.then ->
  casper.test.done()


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true