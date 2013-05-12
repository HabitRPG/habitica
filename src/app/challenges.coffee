_ = require 'underscore'

module.exports.app = (appExports, model) ->
  browser = require './browser'
  helpers = require './helpers'

  user = model.at '_user'

  appExports.challengeCreate = ->
    model.set '_challenge.new',
      name: ''
      habits: []
      daily: []
      todos: []
      rewards: []
      assignTo: 'Party'
    model.set '_challenge.creating', true

  appExports.challengeSave = ->
    challenge = _.defaults model.get('_challenge.new'),
      id: model.id()
      uuid: user.get('id')
      user: helpers.username(model.get('_user.auth'), model.get('_user.profile.name'))
      timestamp: +new Date
    model.unshift '_party.challenges', challenge
    challengeDiscard()
    browser.growlNotification('Challenge Created','success')

  appExports.challengeDiscard = challengeDiscard = ->
    model.set '_challenge.new', {}
    model.set '_challenge.creating', false