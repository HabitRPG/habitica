_ = require('lodash')
helpers = require('habitrpg-shared/script/helpers')

module.exports.app = (appExports, model, app) ->
  browser = require './browser'

  _currentTime = model.at '_currentTime'
  _currentTime.setNull +new Date
  # Every 60 seconds, reset the current time so that the chat can update relative times
  setInterval (->_currentTime.set +new Date), 60000

  appExports.groupCreate = (e,el) ->
    type = $(el).attr('data-type')
    newGroup =
      name: model.get("_new.group.name")
      description: model.get("_new.group.description")
      leader: user.get('id')
      members: [user.get('id')]
      type: type

    # parties - free
    if type is 'party'
      return model.add 'groups', newGroup, ->location.reload()

    # guilds - 4G
    unless user.get('balance') >= 1
      return $('#more-gems-modal').modal 'show'
    if confirm "Create Guild for 4 Gems?"
      newGroup.privacy = (model.get("_new.group.privacy") || 'public') if type is 'guild'
      newGroup.balance = 1 # they spent $ to open the guild, it goes into their guild bank
      model.add 'groups', newGroup, ->
        user.incr 'balance', -1, ->location.reload()

  appExports.toggleGroupEdit = (e, el) ->
    path = "_editing.groups.#{$(el).attr('data-gid')}"
    model.set path, !model.get(path)

  appExports.toggleLeaderMessageEdit = (e, el) ->
    path = "_editing.leaderMessage.#{$(el).attr('data-gid')}"
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
        group = e.get(); groups = g.get()
        {type, name} = group; gid = group.id
        groupError = (msg) -> model.set("_groupError", msg)
        invite = ->
          $.bootstrapGrowl "Invitation Sent."
          switch type
            when 'guild' then model.push "users.#{uid}.invitations.guilds", {id:gid, name}, ->location.reload()
            when 'party' then model.set "users.#{uid}.invitations.party", {id:gid, name}, ->location.reload()

        switch type
          when 'guild'
            if profile.invitations?.guilds and _.find(profile.invitations.guilds, {id:gid})
              return groupError("User already invited to that group")
            else if uid in group.members
              return groupError("User already in that group")
            else invite()
          when 'party'
            if profile.invitations?.party
              return groupError("User already pending invitation.")
            else if _.find(groups, {type:'party'})
              return groupError("User already in a party.")
            else invite()


  appExports.acceptInvitation = (e,el) ->
    gid = e.get('id')
    if $(el).attr('data-type') is 'party'
      user.set 'invitations.party', null, ->joinGroup(gid)
    else
      e.at().remove ->joinGroup(gid)

  appExports.rejectInvitation = (e, el) ->
    clear = -> browser.resetDom(model)
    if e.at().path().indexOf('party') != -1
      model.del e.at().path(), clear
    else e.at().remove clear

  appExports.groupLeave = (e,el) ->
    if confirm("Leave this group, are you sure?") is true
      uid = user.get('id')
      group = model.at "groups.#{$(el).attr('data-id')}"
      index = group.get('members').indexOf(uid)
      if index != -1
        group.remove 'members', index, 1, ->
          updated = group.get()
          # last member out, delete the party
          if _.isEmpty(updated.members) and (updated.type is 'party')
            group.del ->location.reload()
          # assign new leader, so the party is editable #TODO allow old leader to assign new leader, this is just random
          else if (updated.leader is uid)
            group.set "leader", updated.members[0], ->location.reload()
          else location.reload()

  ###
    Chat Functionality
  ###

  model.on 'unshift', '_party.chat', -> $('.chat-message').tooltip()
  model.on 'unshift', '_habitrpg.chat', -> $('.chat-message').tooltip()

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

  appExports.assignGroupLeader = (e, el) ->
    newLeader = model.get('_new.groupLeader')
    if newLeader and (confirm("Assign new leader, you sure?") is true)
      e.at().set('leader', newLeader, ->browser.resetDom(model)) if newLeader
