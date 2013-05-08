_ = require('underscore')
helpers = require './helpers'

partyUnsubscribe = (model, cb) ->
  if window?
    throw "unsubscribe requires cb" unless cb?
    subs = model._subs()
    subs.concat cb
    model.unsubscribe.apply(model, subs)
  else
    cb()

###
  Subscribe to the user, the users's party (meta info like party name, member ids, etc), and the party's members. 3 subscriptions.

  Note - selfQ *must* come after membersQ in subscribe, otherwise _user will only get the fields restricted by party-members in
  store.coffee. Strang bug, but easy to get around
###
module.exports.partySubscribe = partySubscribe = (page, model, params, next, cb) ->

  uuid = model.get('_userId') or model.session.userId # see http://goo.gl/TPYIt
  selfQ = model.query('users').withId(uuid) #keep this for later
  partyQ = model.query('parties').withMember(uuid)

  partyQ.fetch (err, party) ->
    return next(err) if err

    finished = (descriptors, paths) ->
      model.subscribe.apply model, descriptors.concat ->
        [err, refs] = [arguments[0], arguments]
        return next(err) if err
        _.each paths, (path, idx) -> model.ref path, refs[idx+1]
        unless model.get('_user')
          console.error "User not found - this shouldn't be happening!"
          return page.redirect('/logout') #delete model.session.userId
        cb()

    party = party.get()

    # (1) Solo player
    return finished([selfQ, 'tavern'], ['_user', '_tavern']) unless party

    ## (2) Party has members, subscribe to those users too
    membersQ = model.query('users').party(party.members)
    return finished [partyQ, membersQ, selfQ, 'tavern'], ['_party', '_partyMembers', '_user', '_tavern']

module.exports.app = (appExports, model, app) ->
  character = require './character'
  browser = require './browser'
  helpers = require './helpers'

  _currentTime = model.at '_currentTime'

  _currentTime.setNull +new Date()

  # Every 60 seconds, reset the current time so that the chat
  # can update relative times
  setInterval ->
    _currentTime.set +new Date()
  , 60000

  user = model.at('_user')

  model.on 'set', '_user.party.invitation', (after, before) ->
    if !before? and after? # they just got invited
      partyQ = model.query('parties').withId(after)
      partyQ.fetch (err, party) ->
        return next(err) if err
        model.ref '_party', party
        browser.resetDom(model)

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [user.get('id')], invites:[] }
    user.set 'party', {current: id, invitation: null, leader: true}, ->
      window.location.reload true

  appExports.partyInvite = ->
    id = model.get('_newPartyMember').replace(/[\s"]/g, '')
    return if _.isEmpty(id)

    model.query('users').party([id]).fetch (err, users) ->
      throw err if err
      u = users.at(0).get()
      if !u?
        model.set "_partyError", "User with id #{id} not found."
        return
      else if u.party.current? or u.party.invitation?
        model.set "_partyError", "User already in a party or pending invitation."
        return
      else
        $.bootstrapGrowl "Invitation Sent."
        model.set "users.#{id}.party.invitation", model.get('_party.id'), -> window.location.reload()
        #model.set '_newPartyMember', ''
        #partySubscribe model

  appExports.partyAccept = ->
    partyId = user.get('party.invitation')
    user.set 'party.invitation', null
    user.set 'party.current', partyId
    model.at("parties.#{partyId}.members").push user.get('id'), -> window.location.reload()
#    model.query('parties').withId(partyId).fetch (err, p) ->
#      members = p.get('members')
#      members.push user.get('id')
#      p.set 'members', members, ->
#        window.location.reload true

#    partySubscribe model, ->
#      p = model.at('_party')
#      p.push 'members', user.get('id')

  appExports.partyReject = ->
    user.set 'party.invitation', null
    browser.resetDom(model)

  appExports.partyLeave = ->
    #id = user.set 'party.current', null
    party = model.at '_party'
    members = party.get('members')
    index = members.indexOf(user.get('id'))
    party.remove 'members', index, 1, ->
      if members.length is 1 # # last member out, kill the party
        party.del (-> window.location.reload true)
      else
        window.location.reload true

  ###
    Chat Functionality
  ###

  sendChat = (path, input) ->
    chat = model.at path
    text = model.get input
    # Check for non-whitespace characters
    return unless /\S/.test text
    chat.unshift
      id: model.id()
      uuid: user.get('id')
      contributor: user.get('backer.contributor')
      npc: user.get('backer.npc')
      text: text
      user: helpers.username(model.get('_user.auth'), model.get('_user.profile.name'))
      timestamp: +new Date
    model.set(input, '')
    chat.remove 200 # keep a max messages cap

  model.on 'unshift', '_party.chat', -> $('.chat-message').tooltip()
  model.on 'unshift', '_tavern.chat.messages', -> $('.chat-message').tooltip()

  appExports.partySendChat = ->
    sendChat('_party.chat', '_chatMessage')
    model.set '_user.party.lastMessageSeen', model.get('_party.chat')[0].id

  appExports.tavernSendChat = ->
    model.setNull '_tavern.chat', {messages:[]} #we can remove this later, first time run only
    sendChat('_tavern.chat.messages', '_tavernMessage')

  appExports.partyMessageKeyup = (e, el, next) ->
    return next() unless e.keyCode is 13
    appExports.partySendChat()

  appExports.tavernMessageKeyup = (e, el, next) ->
    return next() unless e.keyCode is 13
    appExports.tavernSendChat()

  app.on 'render', (ctx) ->
    $('#party-tab-link').on 'shown', (e) ->
      messages = model.get('_party.chat')
      return false unless messages?.length > 0
      model.set '_user.party.lastMessageSeen', messages[0].id

  appExports.gotoPartyChat = ->
    model.set '_gamePane', true, ->
      $('#party-tab-link').tab('show')
