_ = require 'lodash'
helpers = require 'habitrpg-shared/script/helpers'

module.exports.app = (appExports, model) ->
  browser = require './browser'
  user = model.at '_user'

  $('#profile-challenges-tab-link').on 'show', (e) ->
    _.each model.get('groups'), (g) ->
      _.each g.challenges, (chal) ->
        _.each ['habit','daily','todo'], (type) ->
          _.each chal["#{type}s"], (task) ->
            _.each chal.users, (member) ->
              if (history = member?["#{type}s"]?[task.id]?.history) and !!history
                data = google.visualization.arrayToDataTable _.map(history, (h)-> [h.date,h.value])
                options =
                  backgroundColor: { fill:'transparent' }
                  width: 150
                  height: 50
                  chartArea: width: '80%', height: '80%'
                  axisTitlePosition: 'none'
                  legend: position: 'bottom'
                  hAxis: gridlines: color: 'transparent' # since you can't seem to *remove* gridlines...
                  vAxis: gridlines: color: 'transparent'
                chart = new google.visualization.LineChart $(".challenge-#{chal.id}-member-#{member.id}-history-#{task.id}")[0]
                chart.draw(data, options)


  appExports.challengeCreate = (e,el) ->
    [type, gid] = [$(el).attr('data-type'), $(el).attr('data-gid')]
    model.set '_challenge.new',
      name: ''
      habits: []
      dailys: []
      todos: []
      rewards: []
      id: model.id()
      uid: user.get('id')
      user: helpers.username(model.get('_user.auth'), model.get('_user.profile.name'))
      group: {type, id:gid}
      timestamp: +new Date

  appExports.challengeSave = ->
    gid = model.get('_challenge.new.group.id')
    model.unshift "groups.#{gid}.challenges", model.get('_challenge.new'), ->
      browser.growlNotification('Challenge Created','success')
      challengeDiscard()

  appExports.toggleChallengeEdit = (e, el) ->
    path = "_editing.challenges.#{$(el).attr('data-id')}"
    model.set path, !model.get(path)

  appExports.challengeDiscard = challengeDiscard = -> model.del '_challenge.new'

  appExports.challengeSubscribe = (e) ->
    chal = e.get()

    # Add challenge name as a tag for user
    tags = user.get('tags')
    unless tags and _.find(tags,{id: chal.id})
      model.push '_user.tags', {id: chal.id, name: chal.name, challenge: true}

    tags = {}; tags[chal.id] = true
    # Add all challenge's tasks to user's tasks
    userChallenges = user.get('challenges')
    user.unshift('challenges', chal.id) unless userChallenges and (userChallenges.indexOf(chal.id) != -1)
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      _.each chal["#{type}s"], (task) ->
        task.tags = tags
        task.challenge = chal.id
        task.group = {id: chal.group.id, type: chal.group.type}
        model.push("_#{type}List", task)
        true

  appExports.challengeUnsubscribe = (e) ->
    chal = e.get()
    i = user.get('challenges')?.indexOf chal.id
    user.remove("challenges.#{i}") if i? and i != -1
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      _.each chal["#{type}s"], (task) ->
        model.remove "_#{type}List", _.findIndex(model.get("_#{type}List",{id:task.id}))
        model.del "_user.tasks.#{task.id}"
        true
