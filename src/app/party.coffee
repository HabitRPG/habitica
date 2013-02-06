_ = require('underscore')
schema = require './schema'

_subscriptions =
  party:
    query: null
    id: null
  members:
    query: null
    ids: null

module.exports.partySubscribe = partySubscribe = (model, id, cb) ->
  # New subscription coming in, or reset subscription with new parameters
  if true #!_subscriptions.party.query? or _subscriptions.party.id != id
    _subscriptions.party.query = model.query('parties').withId(id)
    _subscriptions.party.id = id
    _subscriptions.party.query.subscribe (err, p) ->
      throw err if err
      model.ref '_party', p.at(0)
      cb(p.at(0)) if cb?
  else
    cb(model.at('_party')) if cb?

module.exports.membersSubscribe = membersSubscribe = (model, ids, cb) ->
  # New subscription coming in, or reset subscription with new parameters
  if true #!_subscriptions.members.query? or !_.isEmpty(_.difference(_subscriptions.members.ids, ids))
    _subscriptions.members.query = model.query('users').party(ids)
    _subscriptions.members.ids = ids
    _subscriptions.members.query.subscribe (err, m) ->
      throw err if err
      model.ref '_partyMembers', m
      cb(m) if cb?
  else
    cb(model.at('_partyMembers')) if cb?

setupListeners = (model) ->

  model.on 'set', '_user.party.invitation', (id) ->
    partySubscribe model, id

  model.on '*', '_party.members', (ids) ->
    membersSubscribe model, ids

module.exports.app = (appExports, model) ->
  user = model.at('_user')
  setupListeners(model)

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [user.get('id')], invites:[] }
    user.set 'party', {current: id, invitation: null, leader: true}
    partySubscribe model, id

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
        p = model.at '_party'
        p.push "invites", id
        model.set "users.#{id}.party.invitation", p.get('id')
        $.bootstrapGrowl "Invitation Sent."
        $('#party-modal').modal('hide')
        membersSubscribe model, p.get('members')
        model.set '_newPartyMember', ''
        #TODO break old subscription, setup new subscript, remove this reload

  appExports.partyAccept = ->
    invitation = user.get('party.invitation')
    partySubscribe model, invitation, (p) ->
      p.push 'members', user.get('id')
      user.set 'party.invitation', null
      user.set 'party.current', p.get('id')
      membersSubscribe model, p.get('members'), (m)

  appExports.partyReject = ->
    user.set 'party.invitation', null

    # TODO splice parties.*.invites[key]
    # TODO notify sender

  appExports.partyLeave = ->
    id = user.set 'party.current', null
    p = model.at '_party'
    members = p.get('members')
    index = members.indexOf(user.get('id'))
    members.splice(index,1)
    p.set 'members', members
    if (members.length == 0)
      # last member out, kill the party
      model.del "parties.#{id}"
    _subscriptions.party.query.unsubscribe()
    model.set('_party', null)

  #exports.partyDisband = ->
