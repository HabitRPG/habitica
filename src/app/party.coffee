_ = require('underscore')

module.exports = (appExports, model) ->
  user = model.at('_user')

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [], invites: [] }
    user.set 'party', {current: id, invitation: null, leader: true}

  appExports.partyInvite = ->
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

  appExports.partyAccept = ->
    invitation = user.get('party.invitation')
    user.set 'party.current', invitation
    user.set 'party.invitation', null
    model.push "parties.#{invitation}.members", user.get('id')
    window.location.reload()

  appExports.partyReject = ->
    user.set 'party.invitation', null
    # TODO notify sender

  appExports.partyLeave = ->
    id = user.get('party.current')
    user.set 'party.current', null
    members = model.get ("parties.#{id}.members")
    index = members.indexOf(user.get('id'))
    model.set "parties.#{id}.members", members.slice(index)
    window.location.reload()

  appExports.partyDisband = ->


  user.on 'set', 'parties.invitation', (after, before) ->
