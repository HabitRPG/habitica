url = 'http://localhost:3000'
utils = require('utils')
casper = require("casper").create()
uid = undefined

# ---------- Main Stuff ------------

casper.start url, ->
  uid = @evaluate -> window.DERBY.model.get("_user.id")
  utils.dump uid

# ---------- REST API ------------

  casper.thenOpen "#{url}/users/#{uid}"
  casper.thenOpen "#{url}/users/#{uid}/tasks"
  casper.thenOpen "#{url}/users/#{uid}/tasks/{taskId}"
  casper.thenOpen "#{url}/users/#{uid}/tasks/{taskId}"

  casper.thenOpen "#{url}/users/#{uid}/score"

# ---------- Run ------------

casper.run ->
  @test.renderResults true