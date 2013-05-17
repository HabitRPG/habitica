_ = require 'underscore'
lodash = require 'lodash'

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
    chal = e.get()

    # Add challenge name as a tag for user
    tags = user.get('tags')
    unless tags and _.findWhere(tags,{id: chal.id})
      model.push('_user.tags', {id: chal.id, name: chal.name})

    tags = {}; tags[chal.id] = true
    # Add all challenge's tasks to user's tasks
    userChallenges = user.get('challenges')
    user.unshift('challenges', chal.id) unless userChallenges and (userChallenges.indexOf(chal.id) != -1)
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      _.each chal["#{type}s"], (task) ->
        task.tags = tags
        task.challenge = chal.id
        model.push("_#{type}List", task)

  appExports.challengeUnsubscribe = (e) ->
    chal = e.get()
    i = user.get('challenges')?.indexOf chal.id
    user.remove("challenges.#{i}") if i? and i != -1
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      _.each chal["#{type}s"], (task) ->
        model.remove "_#{type}List", lodash.findIndex(model.get("_#{type}List",{id:task.id}))
        model.del "_user.tasks.#{task.id}"

  appExports.challengeCollapse = (e, el) ->
    $(el).next().toggle()
    i = $(el).find('i').toggleClass 'icon-chevron-down'