url = 'http://localhost:3000/?play=1'
utils = require('utils')
casper = require("casper").create
  clientScripts: 'test/includes/lodash.min.js'

# ---------- Util Functions ------------
getUser = -> casper.evaluate -> window.DERBY.app.model.get('_user')

addTasks = () ->
  ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
    # Add 15 of each task type
    num = 0
    casper.repeat 15, ->
      casper.fill "form#new-#{type}", {'new-task': "#{type}-#{num}"} # why can't I use true here?
      casper.click "form#new-#{type} input[type=submit]"

reset = -> casper.evaluate -> window.DERBY.app.reset()

userBeforeAfter = (callback) ->
  user = {}
  user.before = getUser()
  callback()
  user.after = getUser()
  user

runCron = ->
  casper.evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/10/2013'))
  casper.reload()

# ---------- Init ------------

casper.start url, ->
  @test.assertTitle "HabitRPG | Gamify Your Life", "[√] Page Title"

# ---------- Register ------------
#casper.then ->
#  @fill 'form#derby-auth-register',
#    username: 'lefnire'
#    email: 'x@x.com'
#    'email-confirmation': 'x@x.com'
#    password: 'habitrpg123'
#  , true


# ---------- Habits ------------
casper.then ->
  reset()
  addTasks()

casper.then ->
  user = userBeforeAfter (-> casper.click '.habits a[data-direction="down"]')
  @test.assert user.before.stats.hp > user.after.stats.hp, '-habit -hp'
  @test.assert user.before.stats.exp == user.after.stats.exp, '-habit =exp'

  @then ->
    user = userBeforeAfter (-> casper.click '.habits a[data-direction="up"]')
    @test.assert user.before.stats.exp < user.after.stats.exp, '+habit +exp'
    @test.assertEquals user.before.stats.hp, user.after.stats.hp, '+habit =hp'

# Test Death
casper.then ->
  @repeat 50, (-> casper.click '.habits a[data-direction="down"]')
  @then ->
    user = getUser()
    @test.assertEquals user.stats.hp, 0, 'hp==0 (death by habits)'
    @test.assertEquals user.stats.lvl, 0, 'lvl==0 (death by habits)'
    @test.assert(@visible('#dead-modal'), 'Revive Modal Visible')

# ---------- Daily ------------
casper.then ->
  reset()
  addTasks()

# Gained exp on +daily
casper.then ->
  user = userBeforeAfter (-> casper.click '.dailys input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '+daily =hp'
  @test.assert user.before.stats.exp < user.after.stats.exp, '+daily +exp'
  @test.assert user.before.stats.money < user.after.stats.money, '+daily +money'

# -daily acts as undo
casper.then ->
  user = userBeforeAfter (-> casper.click '.dailys input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '-daily =hp'
  @test.assert user.before.stats.exp > user.after.stats.exp, '-daily -exp'
  @test.assert user.before.stats.money > user.after.stats.money, '-daily -money'


# ---------- Todos ------------
casper.then ->
  reset()
  addTasks()

# Gained exp on +daily
casper.then ->
  user = userBeforeAfter (-> casper.click '.todos input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '+daily =hp'
  @test.assert user.before.stats.exp < user.after.stats.exp, '+daily +exp'
  @test.assert user.before.stats.money < user.after.stats.money, '+daily +money'

# -daily acts as undo
casper.then ->
  user = userBeforeAfter (-> casper.click '.todos input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '-daily =hp'
  @test.assert user.before.stats.exp > user.after.stats.exp, '-daily -exp'
  @test.assert user.before.stats.money > user.after.stats.money, '-daily -money'

# ---------- Rewards ------------
#TODO

# ---------- Cron ------------

casper.then ->
  reset()
  addTasks()

casper.then ->
  user = {before:getUser()}
  tasks =
    before:
      daily: @evaluate -> window.DERBY.app.model.get('_dailyList')
      todo: @evaluate -> window.DERBY.app.model.get('_todoList')
  runCron()

  @then ->
    @wait 1050, -> # user's hp is updated after 1s for animation
      user.after = getUser()
      @test.assertEqual user.before.id, user.after.id, 'user id equal after cron'
      tasks.after =
          daily: @evaluate -> window.DERBY.app.model.get('_dailyList')
          todo: @evaluate -> window.DERBY.app.model.get('_todoList')

      @test.assertEqual user.before.tasks.length, user.after.tasks.length, "Didn't lose anything on cron"

      #TODO make sure true for all dailies
      dailyId = tasks.before.daily[0].id
      utils.dump tasks.before.daily
      utils.dump
        dailyBefore:user.before.tasks[dailyId].value
        dailyAfter:user.before.tasks[dailyId].value
      @test.assert user.before.tasks[dailyId].value < user.before.tasks[dailyId].value, "todo gained value on cron"
      @test.assert user.before.stats.hp < user.after.stats.hp, 'user lost HP on cron'

      #TODO make sure true for all todos
      todoId = tasks.before.todo[0].id
      @test.assert user.before.tasks[todoId].value < user.before.tasks[todoId].value, "todo gained value on cron"

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