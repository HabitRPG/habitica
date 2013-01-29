helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

# ---------- Daily ------------
casper.then ->
  helper.reset()
  helper.addTasks()

# Gained exp on +daily
casper.then ->
  user = helper.userBeforeAfter (-> casper.click '.dailys input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '+daily =hp'
  @test.assert user.before.stats.exp < user.after.stats.exp, '+daily +exp'
  @test.assert user.before.stats.money < user.after.stats.money, '+daily +money'

# -daily acts as undo
casper.then ->
  user = helper.userBeforeAfter (-> casper.click '.dailys input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '-daily =hp'
  @test.assert user.before.stats.exp > user.after.stats.exp, '-daily -exp'
  @test.assert user.before.stats.money > user.after.stats.money, '-daily -money'

# ---------- Cron ------------

casper.then ->
  helper.reset()
  helper.addTasks()

casper.then ->
  helper.cronBeforeAfter (beforeAfter) ->
    casper.then ->
        #TODO make sure true for all dailies
        dailyId = beforeAfter.before.tasks.daily[0].id
#        utils.dump
#          dailyBefore:user.before.tasks[dailyId].value
#          dailyAfter:user.before.tasks[dailyId].value
        casper.test.assert beforeAfter.before.user.tasks[dailyId].value < beforeAfter.after.user.tasks[dailyId].value, "daily:cron:daily gained value"
        casper.test.assert beforeAfter.before.user.stats.hp < beforeAfter.after.user.stats.hp, 'daily:cron:hp lost value'

# ---------- Run ------------

casper.run ->
  @test.renderResults true