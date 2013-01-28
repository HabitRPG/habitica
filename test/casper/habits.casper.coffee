helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

# ---------- Register ------------
user = undefined
casper.then -> helper.register()
casper.then -> user = helper.getUser()

# ---------- Habits ------------
casper.then ->
  helper.reset()
  helper.addTasks()

casper.then ->
  u = helper.userBeforeAfter (-> casper.click '.habits a[data-direction="down"]')
  casper.test.assert u.before.stats.hp > u.after.stats.hp, '-habit -hp'
  casper.test.assert u.before.stats.exp == u.after.stats.exp, '-habit =exp'

casper.then ->
  u = helper.userBeforeAfter (-> casper.click '.habits a[data-direction="up"]')
  casper.test.assert u.before.stats.exp < u.after.stats.exp, '+habit +exp'
  casper.test.assertEquals u.before.stats.hp, u.after.stats.hp, '+habit =hp'

# Test Death
casper.then ->
  @repeat 50, (-> casper.click '.habits a[data-direction="down"]')
  casper.then ->
    u = helper.getUser()
    @test.assertEquals u.stats.hp, 0, 'hp==0 (death by habits)'
    @test.assertEquals u.stats.lvl, 0, 'lvl==0 (death by habits)'
    @test.assert(@visible('#dead-modal'), 'Revive Modal Visible')

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true