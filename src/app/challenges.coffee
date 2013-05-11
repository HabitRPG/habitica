module.exports.app = (appExports, model) ->
  user = model.at '_user'

  appExports.challengeCreate = ->
    model.set '_challenge.new',
      name: ''
      habits: []
      dailies: []
      todos: []
      rewards: []
      assignees: 'party'
    model.set '_challenge.creating', true

  appExports.challengeSave = ->
    #TODO

  appExports.challengeDiscard = ->
    model.set '_challenge.new', {}
    model.set '_challenge.creating', false