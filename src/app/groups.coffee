_ = require('lodash')
helpers = require('habitrpg-shared/script/helpers')

module.exports.app = (appExports, model, app) ->
  browser = require './browser'

  _currentTime = model.at '_currentTime'
  _currentTime.setNull +new Date
  # Every 60 seconds, reset the current time so that the chat can update relative times
  setInterval (->_currentTime.set +new Date), 60000

  user = model.at('_user')

  appExports.groupCreate = (e,el) ->
    model.add('groups',
      name: model.get("_newGroup")
      leader: user.get('id')
      members: [user.get('id')]
      type: $(el).attr('data-type')
    , ->location.reload())

  appExports.toggleGroupEdit = (e, el) ->
    path = "_editing.groups.#{$(el).attr('data-gid')}"
    model.set path, !model.get(path)

  appExports.groupAddWebsite = (e, el) ->
    test = e.get()
    e.at().unshift 'websites', model.get('_newGroupWebsite')
    model.del '_newGroupWebsite'

  appExports.groupInvite = (e,el) ->
    uid = model.get('_groupInvitee').replace(/[\s"]/g, '')
    model.set '_groupInvitee', ''
    return if _.isEmpty(uid)

    model.query('users').publicInfo([uid]).fetch (err, profiles) ->
      throw err if err
      profile = profiles.at(0).get()
      return model.set("_groupError", "User with id #{uid} not found.") unless profile
      model.query('groups').withMember(uid).fetch (err, g) ->
        throw err if err

        {type, name} = e.get()
        gid = e.get('id')
        groups = g.get()
        groupError =(msg) -> model.set("_groupError", msg)
        invite = ->
          debugger
          $.bootstrapGrowl "Invitation Sent."
          if type is 'guild'
            model.push("users.#{uid}.invitations.guilds", {id:gid, name}, ->location.reload())
          else model.set "users.#{uid}.invitations.party", {id:gid, name}, ->
            debugger
            location.reload()

        if type is 'guild'
          if _.find(profile.invitations.guilds, {id:gid})
            return groupError("User already invited to that group")
          else if _.find groups, ((group)-> uid in group.members)
            return groupError("User already in that group")
          else invite()
        if type is 'party'
            if profile.invitations.party
              return groupError("User already pending invitation.")
            else if _.find(groups, {type:'party'})
              return groupError("User already in a party.")
            else invite()

  appExports.acceptInvitation = (e,el) ->
    group = e.at().get()
    pushMember = -> model.push("groups.#{group.id}.members", user.get('id'), ->location.reload())
    if $(el).attr('data-type') is 'party'
      user.set 'invitations.party', null, pushMember
    else
      e.at().remove pushMember

  appExports.rejectInvitation = (e, el) ->
    clear = -> browser.resetDom(model)
    if e.at().path().indexOf('party') != -1
      model.del e.at().path(), clear
    else e.at().remove clear

  appExports.groupLeave = (e,el) ->
    members = e.get('members')
    index = members.indexOf(user.get('id'))
    e.at().remove 'members', index, 1, ->
      if members.length is 1 # # last member out, kill the party
        model.del("groups.#{id}", ->location.reload())
      else
        location.reload()

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
