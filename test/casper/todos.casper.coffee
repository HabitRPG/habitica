helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

# ---------- Todos ------------
casper.then ->
  helper.reset()
  helper.addTasks()

# Gained exp on +daily
casper.then ->
  helper.modelBeforeAfter (-> casper.click '.todos input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, 50, 'todo:hp starts at 50'
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '+todo =hp'
    casper.test.assertEquals model.after._user.stats.exp, 1, '+todo exp=1'
    casper.test.assertEquals model.after._user.stats.money, 1, '+todo gp=1'

    #FIXME before._user.stats not fully available until modified? Is this a Derby JIT caching mechanism?
    #casper.test.assert model.before._user.stats.exp < model.after._user.stats.exp, '+todo +exp'
    #casper.test.assert model.before._user.stats.money < model.after._user.stats.money, '+todo +money'

# -daily acts as undo
casper.then ->
  helper.modelBeforeAfter (-> casper.click '.completeds input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '-todo =hp'
    casper.test.assert model.before._user.stats.exp > model.after._user.stats.exp, '-todo -exp'
    casper.test.assert model.before._user.stats.money > model.after._user.stats.money, '-todo -money'
    utils.dump {before:model.before._user.stats, after:model.after._user.stats}

casper.then -> helper.deleteOne('todo')
casper.then -> helper.deleteOne('completed')


# ---------- Cron ------------
casper.then ->
  helper.reset()
  helper.addTasks()

casper.then ->
  helper.cronBeforeAfter (beforeAfter) ->
    casper.then ->
      #TODO make sure true for all todos
      todoId = beforeAfter.before.tasks.todo[0].id
#      utils.dump
#        dailyBefore:user.before.tasks[dailyId].value
#        dailyAfter:user.before.tasks[dailyId].value
      casper.test.assert beforeAfter.before.user.tasks[todoId].value < beforeAfter.after.user.tasks[todoId].value, "todo:cron:todo gained value"
      casper.test.assertEqual beforeAfter.before.user.stats.hp, beforeAfter.after.user.stats.hp, 'todo:cron:hp no change'


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true