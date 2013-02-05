_ = require('underscore')

module.exports.server = (model, cb) ->

  selfQ = model.query('users').withId(model.session.userId)
  model.fetch selfQ, (err, self) ->
    console.error err if err
    currentParty = self.at(0).get('party.current')
    if currentParty
      partiesQ = model.query('parties').withId(currentParty)
      model.fetch partiesQ, (err, parties) ->
        console.error err if err
        membersQ = model.query('users').party(parties.at(0).get('members'))
        cb([partiesQ, membersQ, selfQ])
    else
      cb([selfQ])

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
    user.set 'party.current', invitation
    user.set 'party.invitation', null
    model.push "parties.#{invitation}.members", user.get('id')
    window.location.reload()

  exports.partyReject = ->
    user.set 'party.invitation', null
    # TODO notify sender

  exports.partyLeave = ->
    id = user.get('party.current')
    user.set 'party.current', null
    members = model.get ("parties.#{id}.members")
    index = members.indexOf(user.get('id'))
    newMembers = members.slice(index)
    if (newMembers.length == 0)
      # last member out, kill the party
      model.del "parties.#{id}"
    else
      model.set "parties.#{id}.members", members.slice(index)
    window.location.reload()

  exports.partyDisband = ->

#  user.on 'set', 'parties.invitation', (after, before) ->
#
#  model.on '*', '_party.members', (ids) ->
#    # TODO unsubscribe to previous subscription
#    model.subscribe model.query('users').party(ids), (err, members) ->
#      model.ref '_view.partyMembers', members
