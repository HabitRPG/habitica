helper = new require('./test/casper/helpers')()
casper = helper.casper
utils = helper.utils
url = helper.url

casper.start url + '/?play=1'

# ---------- Rewardsj1 ------------
casper.then ->
  helper.reset()
  helper.addTasks()

casper.then -> @test.assertDoesntExist('ul.items')
casper.then -> @repeat 50, -> casper.click('.habits a[data-direction="up"]')
casper.then -> @test.assertExists('ul.items')

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true