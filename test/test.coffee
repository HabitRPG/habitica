url = 'http://localhost:3000'
utils = require('utils')
casper = require("casper").create()

# ---------- Main Stuff ------------

casper.start url, ->
  @test.assertTitle "HabitRPG", "homepage title is the one expected"


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

# casper.thenOpen "#{url}/terms", ->
  # @test.assertTitle "Terms Of Use", "terms page works"
# 
# casper.thenOpen "#{url}/privacy", ->
  # @test.assertTitle "Privacy Policy", "privacy page works"

casper.run ->
  @test.renderResults true