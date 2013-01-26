helpers = require('./helpers')
casper = helpers.casper
utils = helpers.utils
url = helpers.url

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

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true