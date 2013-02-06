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
    _subscriptions.party.query.subscribe (err, res) ->
      throw err if err
      p = res.at(0)
      model.ref '_party', p
      p.on '*', 'members', (ids) ->
        # FIXME not being triggered...
        membersSubscribe model, ids
      cb(p) if cb?
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

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  model.on 'set', '_user.party.invitation', (id) ->
    partySubscribe model, id

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
    model.fetch query, (err, res) ->
      throw err if err
      u = res.at(0).get()
      if !u?.id?
        model.set "_view.partyError", "User with id #{id} not found."
        return
      else if u.party.current? or u.party.invitation?
        model.set "_view.partyError", "User already in a party or pending invitation."
        return
      else
        p = model.at '_party'
        p.push "invites", id
        model.set "users.#{id}.party.invitation", p.get('id')
        $.bootstrapGrowl "Invitation Sent."
        $('#party-modal').modal('hide')
        model.set '_newPartyMember', ''
        membersSubscribe model, p.get('members'), ->
          # TODO get subscriptions really working so we don't need to reload
          window.location.reload()

  appExports.partyAccept = ->
    invitation = user.get('party.invitation')
    partySubscribe model, invitation, (p) ->
      p.push 'members', user.get('id')
      user.set 'party.invitation', null
      user.set 'party.current', p.get('id')
      membersSubscribe model, p.get('members'), (m) ->
        window.location.reload()

  appExports.partyReject = ->
    user.set 'party.invitation', null
    model.set '_party', null

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
    #_subscriptions.party.query.unsubscribe()
    model.set '_party', null
    model.set '_partyMembers', null
    window.location.reload()

  #exports.partyDisband = ->
