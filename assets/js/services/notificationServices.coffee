angular.module("notificationServices", []).factory "Notification", ->
  #FIXME

  fixMe =
    push: ->
    get: ->
    animate: ->
    clearTimer: ->
    init: ->
  return fixMe

  data = message: ""
  active = false
  timer = null
  hide: ->
    $("#notification").fadeOut ->
      $("#notification").css "webkit-transform", "none"
      $("#notification").css "top", "-63px"
      $("#notification").css "left", "0px"
      setTimeout (->
        $("#notification").show()
      ), 190

    active = false
    timer = null

  animate: ->
    if timer
      clearTimeout timer
      timer = setTimeout(@hide, 2000)
    if active is false
      active = true
      $("#notification").transition
        y: 63
        x: 0

      timer = setTimeout(@hide, 2000)

  push: (message) ->
    data.message = ""
    switch message.type
      when "stats"
        data.message = "Experience: " + message.stats.exp + "<br />GP: " + message.stats.gp.toFixed(2)  if message.stats.exp? and message.stats.gp?
        data.message = "HP: " + message.stats.hp.toFixed(2)  if message.stats.hp
        data.message = "<br />GP: " + message.stats.gp.toFixed(2)  if message.stats.gp and not message.stats.exp?
      when "text"
        data.message = message.text
    @animate()

  get: ->
    data

  clearTimer: ->
    clearTimeout timer
    timer = null
    active = false

  init: ->
    timer = setTimeout(@hide, 2000)
