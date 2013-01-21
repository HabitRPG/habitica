url = 'http://localhost:3000/?play=1'
utils = require('utils')
casper = require("casper").create
  clientScripts: 'test/includes/lodash.min.js'

# ---------- Util Functions ------------
getUser = () -> casper.evaluate -> window.DERBY.app.model.get('_user')

# ---------- Init ------------

casper.start url, ->
  @test.assertTitle "HabitRPG | Gamify Your Life", "[√] Page Title"

# ---------- Remove sample tasks ------------
casper.then ->
  @evaluate ->
    model = window.DERBY.app.model
    tasks = model.get('_user.tasks')
    _.each tasks, (task) -> model.remove()
    model.set '_user.tasks', {}
    model.set '_user.habitIds', []
    model.set '_user.dailyIds', []
    model.set '_user.todoIds', []
    model.set '_user.rewardIds', []
  @then -> @reload()
  # FIXME this function does jack shit

# ---------- Setup Tasks ------------
casper.then ->
  ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
    # Add 15 of each task type
    num = 0
    casper.repeat 15, ->
      casper.fill "form#new-#{type}", {'new-task': "#{type}-#{num}"} # why can't I use true here?
      casper.click "form#new-#{type} input[type=submit]"

# ---------- Habit ------------
casper.then ->
  userBefore = getUser()
  @click '.habits a[data-direction="down"]'
  userAfter = getUser()
  @test.assert userBefore.stats.hp > userAfter.stats.hp, '-habit: -hp'
  @test.assert userBefore.stats.exp == userAfter.stats.exp, '-habit: =exp'

  @then ->
    useBefore = getUser()
    @click '.habits a[data-direction="up"]'
    userAfter = getUser()
    @test.assert userBefore.stats.exp < userAfter.stats.exp, '+habit: +exp'
    @test.assert userBefore.stats.hp == userAfter.stats.hp, '+habit: =hp'

# Test Death
casper.then ->
  @repeat 50, ->
    @click '.habits a[data-direction="down"]'

  @then ->
    userStats = @evaluate ->
      window.DERBY.app.model.get('_user.stats')
    utils.dump userStats

    @test.assert(@visible('#dead-modal'), 'Revive Modal Visible')
    @test.assert(userStats.hp == 0, 'User HP: 0')
    @test.assert(userStats.lvl == 0, 'User Lvl: 0')
    @test.assert(userStats.money == 0, 'User GP: 0')

# ---------- Cron ------------
casper.then ->

  tasksBefore = @evaluate ->
    model = window.DERBY.app.model
    { habits:model.get('_habitList'), dailies:model.get('_dailyList'), todos:model.get('_todoList'), rewards:model.get('_rewardList')}

  # Run Cron
  @evaluate -> window.DERBY.model.set('_user.lastCron', new Date('01/10/2013'))
  @echo 'Refreshing page (running cron)'
  @reload()

  @then ->
#    @wait 1000, ->
    user = getUser()
    tasksAfter = @evaluate ->
      model = window.DERBY.app.model
      { habits:model.get('_habitList'), dailies:model.get('_dailyList'), todos:model.get('_todoList'), rewards:model.get('_rewardList')}

    @test.assert tasksBefore.count == tasksAfter.count, "[√] We didn't lose anything"
    utils.dump {before:tasksBefore.todos[4], after:tasksAfter.todos[4]}
    @test.assert tasksBefore.todos[4].value < tasksAfter.todos[4].value, "Todo gained value on cron"
    @test.assertEqual user.stats.hp, 13, 'User lost HP on cron'


# ---------- Misc Pages ------------

casper.thenOpen "#{url}/terms", ->
  @test.assertTitle "Terms Of Use", "terms page works"

casper.thenOpen "#{url}/privacy", ->
  @test.assertTitle "Privacy Policy", "privacy page works"

# ---------- Run ------------

casper.run ->
  @test.renderResults true