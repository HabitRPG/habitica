character = require './character'

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

  appExports.profileChangeActive = (e, el) ->
    uid = $(el).attr('data-uid')
    model.ref '_profileActive', model.at("users.#{uid}")
    model.set '_profileActiveMain', model.get('_user.id') == uid
    model.set '_profileActiveUsername', character.username model.get('_profileActive.auth')

