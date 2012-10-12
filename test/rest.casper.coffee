url = 'http://localhost:3000'
utils = require('utils')
casper = require("casper").create()
uid = undefined

# ---------- Main Stuff ------------

casper.start url, ->
  uid = @evaluate -> window.DERBY.model.get("_user.id")

  # ---------- REST API ------------

  # casper.thenOpen "#{url}/users/#{uid}"
  # casper.thenOpen "#{url}/users/#{uid}/tasks"
  # casper.thenOpen "#{url}/users/#{uid}/tasks/{taskId}"

  taskId = 'productivity'
  pomodoro = {
    'title': 'Stay Focused',
    'service':  'pomodoro',
    'icon': 'http://www.veryicon.com/icon/16/Food%20%26%20Drinks/Paradise%20Fruits/Tomato.png'
  }

  @thenOpen "#{url}/users/#{uid}/tasks/#{taskId}/up", {
    method: 'post',
    data: pomodoro
  }

  @thenOpen "#{url}/users/#{uid}/tasks/#{taskId}/down", {
    method: 'post',
    data: pomodoro
  }

# ---------- Run ------------

casper.run ->
  @test.renderResults true