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
  user = helper.userBeforeAfter (-> casper.click '.todos input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '+daily =hp'
  @test.assert user.before.stats.exp < user.after.stats.exp, '+daily +exp'
  @test.assert user.before.stats.money < user.after.stats.money, '+daily +money'

# -daily acts as undo
casper.then ->
  user = helper.userBeforeAfter (-> casper.click '.todos input[type="checkbox"]')
  @test.assertEquals user.before.stats.hp, user.after.stats.hp, '-daily =hp'
  @test.assert user.before.stats.exp > user.after.stats.exp, '-daily -exp'
  @test.assert user.before.stats.money > user.after.stats.money, '-daily -money'

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true