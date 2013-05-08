character = require './character'
browser = require './browser'
helpers = require './helpers'

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.profileAddWebsite = (e, el) ->
    newWebsite = model.get('_newProfileWebsite')
    return if /^(\s)*$/.test(newWebsite)
    user.unshift 'profile.websites', newWebsite
    model.set '_newProfileWebsite', ''

  appExports.profileEdit = (e, el) -> model.set '_profileEditing', true
  appExports.profileSave = (e, el) -> model.set '_profileEditing', false
  appExports.profileRemoveWebsite = (e, el) ->
    sites = user.get 'profile.websites'
    i = sites.indexOf $(el).attr('data-website')
    sites.splice(i,1)
    user.set 'profile.websites', sites


  toggleGamePane = ->
    model.set '_gamePane', !model.get('_gamePane'), ->
      browser.setupTooltips()

  appExports.clickAvatar = (e, el) ->
    uid = $(el).attr('data-uid')
    if uid is model.get('_userId') # clicked self
      toggleGamePane()
    else
      $("#avatar-modal-#{uid}").modal('show')

  appExports.toggleGamePane = -> toggleGamePane()

  appExports.toggleResting = ->
    model.set '_user.flags.rest', !model.get('_user.flags.rest')

