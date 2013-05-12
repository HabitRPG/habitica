_ = require 'underscore'

module.exports.app = (appExports, model) ->
  browser = require './browser'
  helpers = require './helpers'

  user = model.at '_user'

  appExports.challengeCreate = ->
    model.set '_challenge.new',
      name: ''
      habits: []
      dailys: []
      todos: []
      rewards: []
      assignTo: 'Party'
      id: model.id()
      uuid: user.get('id')
      user: helpers.username(model.get('_user.auth'), model.get('_user.profile.name'))
      timestamp: +new Date

    model.set '_challenge.creating', true

  appExports.challengeSave = ->
    model.unshift '_party.challenges', model.get('_challenge.new'), -> challengeDiscard()
    browser.growlNotification('Challenge Created','success')

  appExports.challengeDiscard = challengeDiscard = ->
    model.set '_challenge.new', {}
    model.set '_challenge.creating', false

  appExports.challengeSubscribe = (e) ->
    userChallenges = user.get('challenges')
    chal = e.get()
    user.unshift('challenges', chal.id) unless userChallenges and (userChallenges.indexOf(chal.id) != -1)
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      _.each chal["#{type}s"], (task) -> model.push("_#{type}List", task)

  appExports.challengeUnsubscribe = (e) ->
    i = user.get('challenges')?.indexOf e.get('id')
    user.remove("challenges.#{i}") if i? and i != -1

  appExports.challengeCollapse = (e, el) ->
    $(el).next().toggle()
    i = $(el).find('i').toggleClass 'icon-chevron-down'