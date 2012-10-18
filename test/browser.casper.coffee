url = 'http://localhost:3000'
utils = require('utils')
casper = require("casper").create()

# ---------- Main Stuff ------------

casper.start url, ->
  @test.assertTitle "HabitRPG", "homepage title is the one expected"

# ---------- Setup Tasks ------------
casper.then ->
  ['habit', 'daily', 'todo', 'reward'].forEach (type) ->
    # Add 15 of each task type
    casper.repeat 15, -> 
      casper.fill "form#new-#{type}", {'new-task': type } # why can't I use true here?
      casper.click "form#new-#{type} input[type=submit]"
  @then ->
    utils.dump @evaluate -> _.pluck(window.DERBY.model.get('_user.tasks'), 'text')
    

# ---------- Run Cron ------------
casper.then ->
  @evaluate -> window.DERBY.model.set('_user.lastCron', new Date('09/01/2012'));
  @then -> @reload -> 
    @echo 'Refreshing page (running cron)'
  @then -> @reload ->
    @echo 'Refreshing page (trying to trigger the database-spaz bug)'

# ---------- Todos gain delta on cron ------------
casper.then ->
  todoBefore = @evaluate -> window.DERBY.model.get('_todoList')[0]
  @then -> 
    @evaluate ->
      window.DERBY.model.set('_user.lastCron', new Date('09/17/2012'))
  @then -> @reload()
  @then ->
    @wait 2000, ->
      todoAfter = @evaluate -> window.DERBY.model.get('_todoList')[0]
      @then -> @test.assert(todoBefore.value > todoAfter.value, "Incomplete TODO gained value on cron")
      utils.dump todoBefore
      utils.dump todoAfter

# ---------- User Death ------------
casper.then ->
  @repeat 55, ->
    @click '.habits a[data-direction="down"]'
    
casper.then ->
  userStats = @evaluate ->
    window.DERBY.model.get('_user.stats')
  utils.dump userStats
  
  @test.assert(@visible('#dead-modal'), 'Revive Modal Visible')
  @test.assert(userStats.hp == 0, 'User HP: 0')   
  @test.assert(userStats.lvl == 0, 'User Lvl: 0')   
  @test.assert(userStats.money == 0, 'User GP: 0')   
  
# ---------- Misc Pages ------------

casper.thenOpen "#{url}/terms", ->
  @test.assertTitle "Terms Of Use", "terms page works"

casper.thenOpen "#{url}/privacy", ->
  @test.assertTitle "Privacy Policy", "privacy page works"

# ---------- Run ------------

casper.run ->
  @test.renderResults true