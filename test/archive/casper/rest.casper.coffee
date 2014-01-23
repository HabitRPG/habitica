url = 'http://localhost:3000'
utils = require('utils')
casper = require("casper").create()

user1 = {}
user2 = {}

# ---------- Main Stuff ------------

casper.start "#{url}/?play=1", ->
  user1 = casper.evaluate -> window.DERBY.app.model.get("_user")
  @fill 'form#derby-auth-register',
    username: user1.id
    email: "{user1.id}@gmail.com"
    password: 'habitrpg123'
    'password-confirmation': "habitrpg123"
  , true
casper.thenOpen "#{url}/logout"
casper.thenOpen "#{url}/?play=1", ->
  user2 = @evaluate -> window.DERBY.app.model.get("_user")
  casper.then -> @test.assertNotEquals user1.id, user2.id, '2 new users created'


  # ---------- REST API ------------

  # casper.thenOpen "#{url}/users/#{user.id}"
  # casper.thenOpen "#{url}/users/#{user.id}/tasks"
  # casper.thenOpen "#{url}/users/#{user.id}/tasks/{taskId}"

  taskId = 'productivity'
  pomodoro = {
    'title': 'Stay Focused',
    'service':  'pomodoro',
    'icon': 'http://www.veryicon.com/icon/16/Food%20%26%20Drinks/Paradise%20Fruits/Tomato.png'
  }

  # ---------- v1 ------------

  @thenOpen "#{url}/users/#{user2.id}/tasks/#{taskId}/up", {
    method: 'post',
    data: pomodoro
  }, ->
    result = JSON.parse @getPageContent()
    @test.assertEqual user2.stats.hp, result.hp, 'REST +habit =hp'
    @test.assert user2.stats.exp < result.exp, 'REST +habit +exp'
    @test.assert user2.stats.money < result.money, 'REST +habit +money'
    utils.dump result

  @thenOpen "#{url}/users/#{user1.id}/tasks/#{taskId}/down", {
    method: 'post',
    data: pomodoro
  }, ->
    result = JSON.parse @getPageContent()
    @test.assert user1.stats.hp > result.hp, 'REST -habit -hp'
    @test.assertEqual user1.stats.exp, result.exp, 'REST -habit =exp'
    @test.assertEqual user1.stats.money, result.money, 'REST -habit =money'
    utils.dump result

casper.thenOpen "#{url}/?play=1", ->
  # User2 is logged in by now. Make sure we don't get logged in as user1 since that was the last REST call
  current = casper.evaluate -> window.DERBY.app.model.get('_user')
  casper.then -> casper.test.assertEqual current.id, user2.id, "session remains user2's"

  # ---------- v2 ------------

#  @thenOpen "#{url}/v2/users/#{uid}/tasks/#{taskId}/down", {
#    method: 'post',
#    data: pomodoro
#  }

# ---------- Run ------------

casper.run ->
  @test.renderResults true