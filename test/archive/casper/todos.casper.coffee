helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# ---------- Todos ------------
casper.then ->
  helpers.reset()
  helpers.addTasks(['todo'])

# Completing todo gives exp and gp
casper.then ->
  helpers.modelBeforeAfter (-> casper.click '.todos .uncompleted input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, 50, 'todo:hp starts at 50'
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '+todo =hp'
    casper.test.assertEquals model.after._user.stats.exp, 1, '+todo exp=1'
    casper.test.assertEquals model.after._user.stats.gp, 1, '+todo gp=1'

    casper.test.assert model.before._user.stats.exp < model.after._user.stats.exp, '+todo +exp'
    casper.test.assert model.before._user.stats.gp < model.after._user.stats.gp, '+todo +gp'

# Can delete completed
casper.then -> helpers.deleteOne('todo', '.todos .completed')

# Can delete uncompleted
casper.then -> helpers.deleteOne('todo', '.todos .uncompleted')

# Uncompleting subtracts exp and gp
casper.then ->
  casper.click '.todos .uncompleted input[type="checkbox"]'
  helpers.modelBeforeAfter (-> casper.click '.todos .completed input[type="checkbox"]'), (model) ->
    casper.test.assertEquals model.before._user.stats.hp, model.after._user.stats.hp, '-todo =hp'
    casper.test.assert model.before._user.stats.exp > model.after._user.stats.exp, '-todo -exp'
    casper.test.assert model.before._user.stats.gp > model.after._user.stats.gp, '-todo -gp'



# ---------- Cron ------------
casper.then ->
  helpers.reset()
  helpers.addTasks(['todo'])

casper.then ->
  helpers.cronBeforeAfter (model) ->
    casper.then ->
      casper.test.assertEqual model.before._user.stats.hp, model.after._user.stats.hp, 'todo:cron:hp no change'

      # Go through all the todos, all of them are uncompleted, so should all get a negative value
      casper.echo "Testing all uncompleted todos after cron"
      for id in model.before._user.todoIds
        casper.test.assertEquals model.before._user.tasks[id].value, 0, "todo:cron:todo value before was 0"
        casper.test.assert model.after._user.tasks[id].value < 0, "todo:cron:todo value after is negative"


# ---------- Run ------------
casper.run ->
  casper.test.renderResults true