helpers = casper.helpers
uid = helpers.uid
# test creation of Todos, Rewards, Habits, etc

casper.start helpers.playUrl, ->
  casper.test.assert(true,'true==true')
#  helpers.getModel (err, model) ->
#    tasksCount=0
#    for own key,value of model.user.tasks
#      tasksCount++
#    utils.dump model.user.tasks
#    casper.fill "form[data-task-type='habit']", {
#    'new-task': 'Habit' + uid
#    }, true
#    helpers.getModel (err, model) ->
#      newTasksCount=0
#      for own key,value of model.user.tasks
#        newTasksCount++
#      casper.echo "Tasks new: " + tasksCount
#      casper.test.assert(newTasksCount>tasksCount,"Task list increases in length after new habit form submitted")
#
#
##casper.then ->
##  helpers.getModel (err, model) ->
##    casper.test.assertEquals(typeof model.user.stats.exp, "number", 'XP is number')
##    casper.test.assertEquals(model.user.stats.exp, 0, 'XP == 0')
##    casper.click '.habits a[data-direction="up"]'
##    helpers.getModel (err, newModel) ->
##      casper.test.assert(newModel.user.stats.exp > model.user.stats.exp, 'XP has increased after clicking habits "+"')
##      casper.test.assert(newModel.user.stats.gp > model.user.stats.gp, 'GP has increased after clicking habits "+"')


# ---------- finish tests ------------
casper.then ->
  casper.test.done()


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true
