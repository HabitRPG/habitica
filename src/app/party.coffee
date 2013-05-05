_ = require('underscore')

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
  1) If the user is solo, just subscribe to the user.
  2) If in a an empty party, just subscribe to the user & party meta.
  3) If full party, subscribe to everything.

  Note a strange hack - we subscribe to queries incrementally. First self, then party, then party members.
  Party members come with limited fields, so you can't hack their stuff. Strangely, subscribing to the members after
  already subscribing to self limits self's fields to the fields which members are limited to. As a result, we have
  to re-subscribe to self to get all the fields (otherwise everything breaks). Weirdly, this last subscription doesn't
  do the opposite - granting all the fields back to members. I dont' know what's going on here

  Another issue: `model.unsubscribe(selfQ)` would seem to mitigate  the above, so we at least don't have a stray
  subscription floating around - but alas, it doesn't seem to work (or at least never calls the callback)
###
module.exports.partySubscribe = partySubscribe = (page, model, params, next, cb) ->

  # unsubscribe from everything - we're starting over
  # partyUnsubscribe model, ->

  # Restart subscription to the main user
  selfQ = model.query('users').withId (model.get('_userId') or model.session.userId) # see http://goo.gl/TPYIt
  selfQ.fetch (err, user) ->
    return next(err) if err
    unless user.get()
      #return next("User not found - this shouldn't be happening!")
      console.error "User not found - this shouldn't be happening!"
      return page.redirect('/logout') #delete model.session.userId

    finished = (descriptors, paths) ->
      descriptors.push 'tavern'; paths.push '_tavern'
      model.subscribe.apply model, descriptors.concat ->
        [err, refs] = [arguments[0], arguments]
        return next(err) if err
        _.each paths, (path, idx) -> model.ref path, refs[idx+1]
        cb()


    # Attempted handling for 'party of undefined' error, which is caused by bustedSession (see derby-auth).
    # Theoretically simply reloading the page should restore model.at('_userId') and the second load should work just fine
    # bustedSession victims might hit a redirection loop if I'm wrong :/
#    return page.redirect('/') unless uObj

    partyId = user.get('party.current')

    # (1) Solo player
    return finished([selfQ], ['_user']) unless partyId

    # User in a party
    partyQ = model.query('parties').withId(partyId)
    partyQ.fetch (err, party) ->
      return next(err) if err
      members = party.get('members')

      ## (2) Party has no members, just subscribe to the party itself
      return finished([partyQ, selfQ], ['_party', '_user']) if _.isEmpty(members)

      ## (3) Party has members, subscribe to those users too
      membersQ = model.query('users').party(members)
      return finished [partyQ, membersQ, selfQ], ['_party', '_partyMembers', '_user']

module.exports.app = (appExports, model, app) ->
  character = require './character'
  browser = require './browser'
  helpers = require './helpers'

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
#    partySubscribe model, -> $('#party-modal').modal('show')

  appExports.partyInvite = ->
    id = model.get('_newPartyMember').replace(/[\s"]/g, '')
    return if _.isEmpty(id)

    model.query('users').party([id]).fetch (err, res) ->
      throw err if err
      u = res.at(0).get()
      if !u?
        model.set "_partyError", "User with id #{id} not found."
        return
      else if u.party.current? or u.party.invitation?
        model.set "_partyError", "User already in a party or pending invitation."
        return
      else
        p = model.at '_party'
        #p.push "invites", id
        $.bootstrapGrowl "Invitation Sent."
        $('#party-modal').modal('hide')
        model.set "users.#{id}.party.invitation", p.get('id'), -> window.location.reload(true)
        #model.set '_newPartyMember', ''
        #partySubscribe model

  appExports.partyAccept = ->
    partyId = user.get('party.invitation')
    user.set 'party.invitation', null
    user.set 'party.current', partyId
    model.at("parties.#{partyId}.members").push user.get('id'), -> window.location.reload(true)
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
    # TODO splice parties.*.invites[key]
    # TODO notify sender

  appExports.partyLeave = ->
    id = user.set 'party.current', null
    p = model.at '_party'
    members = p.get('members')
    index = members.indexOf(user.get('id'))
    members.splice(index,1)
    p.set 'members', members, ->
      if (members.length == 0)
        # last member out, kill the party
        model.del "parties.#{id}", -> window.location.reload true
      else
        window.location.reload true
#    model.set '_party', null
#    model.set '_partyMembers', null
#    partyUnsubscribe model, ->
#      selfQ = model.query('users').withId model.get('_userId') #or model.session.userId # see http://goo.gl/TPYIt
#      selfQ.subscribe (err, u) ->
#        model.ref '_user', u
#        browser.resetDom model

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
