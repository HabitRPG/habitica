_ = require('lodash')
helpers = require('habitrpg-shared/script/helpers')

module.exports.app = (appExports, model, app) ->
  character = require './character'
  browser = require './browser'

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
      partyQ = model.query('groups').withId(after)
      partyQ.fetch (err, party) ->
        return next(err) if err
        model.ref '_party', party
        browser.resetDom(model)

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'groups', { name: newParty, leader: user.get('id'), members: [user.get('id')], invites:[] }
    user.set 'party', {current: id, invitation: null}, ->
      window.location.reload true

  appExports.partyInvite = ->
    id = model.get('_newPartyMember').replace(/[\s"]/g, '')
    return if _.isEmpty(id)

    model.query('users').publicInfo([id]).fetch (err, users) ->
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
    model.at("groups.#{partyId}.members").push user.get('id'), -> window.location.reload()
#    model.query('groups').withId(partyId).fetch (err, p) ->
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
    id = user.set 'party.current', null
    party = model.at '_party'
    members = party.get('members')
    index = members.indexOf(user.get('id'))
    party.remove 'members', index, 1, ->
      if members.length is 1 # # last member out, kill the party
        model.del "groups.#{id}", (-> window.location.reload true)
      else
        window.location.reload true

  ###
    Chat Functionality
  ###

  model.on 'unshift', '_party.chat', -> $('.chat-message').tooltip()
  model.on 'unshift', '_habitrpg.chat', -> $('.chat-message').tooltip()

  appExports.sendChat = (e,el) ->
    text = model.get '_chatMessage'
    # Check for non-whitespace characters
    return unless /\S/.test text

    group = e.at()
    chat = group.at('chat')
    model.set('_chatMessage', '')

    message =
      id: model.id()
      uuid: user.get('id')
      contributor: user.get('backer.contributor')
      npc: user.get('backer.npc')
      text: text
      user: helpers.username(model.get('_user.auth'), model.get('_user.profile.name'))
      timestamp: +new Date

    # FIXME - sometimes racer will send many duplicates via chat.unshift. I think because it can't make connection, keeps
    # trying, but all attempts go through. Unfortunately we can't do chat.set without potentially clobbering other chatters,
    # and we can't make chat an object without using refLists. hack solution for now is to unshift, and if there are dupes
    # after we set to unique
    chat.unshift message, ->
      messages = chat.get() || []
      count = messages.length
      messages =_.uniq messages, true, ((m) -> m?.id) # get rid of dupes
      #There were a bunch of duplicates, let's clean it up
      if messages.length != count
        messages.splice(200)
        chat.set messages
      else
        chat.remove(200)
    type = $(el).attr('data-type')
    model.set '_user.party.lastMessageSeen', chat.get()[0].id  if group.get('type') is 'party'

  appExports.chatKeyup = (e, el, next) ->
    return next() unless e.keyCode is 13
    appExports.sendChat(e, el)

  appExports.deleteChatMessage = (e) ->
    if confirm("Delete chat message?") is true
      e.at().remove() #requires the {#with}

  app.on 'render', (ctx) ->
    $('#party-tab-link').on 'shown', (e) ->
      messages = model.get('_party.chat')
      return false unless messages?.length > 0
      model.set '_user.party.lastMessageSeen', messages[0].id

  appExports.gotoPartyChat = ->
    model.set '_gamePane', true, ->
      $('#party-tab-link').tab('show')
