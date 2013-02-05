_ = require('underscore')
schema = require './schema'

module.exports.app = (exports, model) ->
  user = model.at('_user')

  exports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [user.get('id')] }
    user.set 'party', {current: id, invitation: null, leader: true}

  exports.partyInvite = ->
    id = model.get('_newPartyMember').replace(/[\s"]/g, '')
    return if _.isEmpty(id)

    obj = user.get()
    query = model.query('users').party([id])
    model.fetch query, (err, users) ->
      throw err if err
      partyMember = users.at(0).get()
      if !partyMember?.id?
        model.set "_view.partyError", "User with id #{id} not found."
        return
      else if partyMember.party.current?.id? or partyMember.party.invitation?
        model.set "_view.partyError", "User already in a party or pending invitation."
        return
      else
        model.push "parties.#{obj.party.current}.invites", id
        model.set "users.#{id}.party.invitation", obj.party.current
        $.bootstrapGrowl "Invitation Sent."
        $('#party-modal').modal('hide')
        #model.set '_newPartyMember', ''
        #window.location.reload() #TODO break old subscription, setup new subscript, remove this reload

  exports.partyAccept = ->
    invitation = user.get('party.invitation')
    model.push "parties.#{invitation}.members", user.get('id')
    user.set 'party.invitation', null, ->
      user.set 'party.current', invitation, ->
          window.location.reload()

  exports.partyReject = ->
    user.set 'party.invitation', null
    # TODO splice parties.*.invites[key]
    # TODO notify sender

  exports.partyLeave = ->
    id = user.get('party.current')
    user.set 'party.current', null, ->
      members = model.get "parties.#{id}.members"
      index = members.indexOf(user.get('id'))
      newMembers = members.slice(index)
      model.set "parties.#{id}.members", newMembers ->
        if (newMembers.length == 0)
          # last member out, kill the party
          model.del "parties.#{id}", -> window.location.reload()
        else
          window.location.reload()

  exports.partyDisband = ->

  user.on 'set', 'party.invitation', (id) ->
    model.fetch "parties.#{id}", (err, party) -> model.set '_party', party
#
#  model.on '*', '_party.members', (ids) ->
#    # TODO unsubscribe to previous subscription
#    model.subscribe model.query('users').party(ids), (err, members) ->
#      model.ref '_view.partyMembers', members
