_ = require('underscore')
schema = require './schema'

setupListeners = (model) ->

  model.on 'set', '_user.party.invitation', (id) ->
    model.subscribe model.query('parties').withId(id), (err, party) -> model.set '_party', party

  model.on '*', '_party.members', (ids) ->
    # TODO unsubscribe to previous subscription
    q = model.query('users').party(ids)
    model.subscribe q, (err, members) -> model.ref '_partyMembers', members

module.exports.app = (appExports, model) ->
  user = model.at('_user')
  setupListeners(model)

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [user.get('id')], invites:[] }
    user.set 'party', {current: id, invitation: null, leader: true}
    model.subscribe model.query('parties').withId(id), (err, party) ->
      throw err if err
      model.ref '_party', party.at(0)
      setupListeners(model)

  appExports.partyInvite = ->
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
        party = model.at '_party'
        party.push "invites", id
        model.set "users.#{id}.party.invitation", party.get('id')
        $.bootstrapGrowl "Invitation Sent."
        $('#party-modal').modal('hide')
        model.subscribe model.query('users').party(party.get('members')), (err, members) ->
          throw err if err
          model.ref '_partyMembers', members
        model.set '_newPartyMember', ''
        #TODO break old subscription, setup new subscript, remove this reload

  appExports.partyAccept = ->
    invitation = user.get('party.invitation')
    model.subscribe model.query("parties").withId(invitation), (err, parties) ->
      throw err if err
      party = parties.at(0)
      party.push 'members', user.get('id')
      user.set 'party.invitation', null
      user.set 'party.current', party.get('id')
      model.ref '_party', party
      model.subscribe model.query('users').party(party.get('members')), (err, members) ->
        throw err if err
        model.ref '_partyMembers', members

  appExports.partyReject = ->
    user.set 'party.invitation', null

    # TODO splice parties.*.invites[key]
    # TODO notify sender

  appExports.partyLeave = ->
    id = user.set 'party.current', null
    party = model.at '_party'
    members = party.get('members')
    index = members.indexOf(user.get('id'))
    members.splice(index,1)
    party.set 'members', members
    if (members.length == 0)
      # last member out, kill the party
      model.del "parties.#{id}"
    model.unsubscribe model.query('parties').withId(id)
    model.set('_party', null)

  #exports.partyDisband = ->
