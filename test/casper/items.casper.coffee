helpers = new require('./test/casper/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.start url

# ---------- Items (in-game rewards) ------------
casper.then ->
  helpers.reset()
  helpers.addTasks(['habit'], 1)

casper.then -> casper.test.assertDoesntExist 'ul.items', 'no items after reset'
casper.then -> casper.repeat 70, ->
  casper.click '.habits a[data-direction="up"]'
casper.then ->
  casper.test.assertVisible '.item-store-popover', 'store popover visible'
  casper.test.assertExists 'ul.items', 'items appear after lvl up'

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true