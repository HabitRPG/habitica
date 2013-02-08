_ = require('underscore')
schema = require './schema'
browser = require './browser'

partyQ = null
membersQ = null

partyUnsubscribe = (model) ->
  if window?
    subs = model._subs()
    model.unsubscribe.apply(model, subs)

module.exports.partySubscribe = partySubscribe = (model, cb) ->

  # unsubscribe from everything - we're starting over
  partyUnsubscribe model

  # Restart subscription to the main user
  selfQ = model.query('users').withId(model.get('_userId') or model.session.userId)
  selfQ.subscribe (err, res) ->
    throw err if err
    u = res.at(0)
    uObj = u.get()

    # If user not in a party, just send over that subscription
    unless uObj.party?.current
      model.ref '_user', u
      return cb()

    # User in a party
    partiesQ = model.query('parties').withId(uObj.party.current)
    partiesQ.subscribe (err, res) ->
      throw err if err
      p = res.at(0)
      model.ref '_party', p

      # FIXME this is the kicker right here. This isn't getting triggered, and it's the reason why we have to refresh
      # after every event. Get this working
      #p.on '*', 'members', (ids) ->
      #  console.log("members listener got called")
      #  debugger
      #  membersSubscribe model, ids

      finished = (cb) ->
        # Here's a hack we need to get fixed (hopefully Lever will) - later model.queries override previous model.queries'
        # returned fields. Aka, we need this here otherwise we only get the "public" fields for the current user, which
        # are defined in model.query('users')party()
        model.subscribe selfQ, (err, users) ->
          model.ref '_user', users.at(0)
          browser.resetDom(model) if window?
          cb() if cb?


      ids = p.get('members')
      # Party has no members, just subscribe to the party itself
      if _.isEmpty(ids)
        finished(cb)

      # Party has members, subscribe to those users too
      else
        membersQ = model.query('users').party(ids)
        membersQ.subscribe (err, m) ->
          throw err if err
          model.ref '_partyMembers', m
          finished(cb)


module.exports.app = (appExports, model) ->
  user = model.at('_user')

  user.on 'set', 'flags.partyEnabled', (captures, args) ->
    return unless captures == true
    html = """
           <div class='party-system-popover'>
           <img src='/img/party-unlocked.png' style='float:right;padding:5px;' />
           Congratulations, you have unlocked the Party System! You can now group with your friends by adding their User Ids.
           <a href='#' onClick="$('.main-avatar').popover('hide');return false;">[Close]</a>
           </div>
           """
    $('.main-avatar').popover
      title: "Party System Unlocked"
      placement: 'bottom'
      trigger: 'manual'
      html: true
      content: html
    $('.main-avatar').popover 'show'

  model.on 'set', '_user.party.invitation', -> partySubscribe(model)

  appExports.partyCreate = ->
    newParty = model.get("_newParty")
    id = model.add 'parties', { name: newParty, leader: user.get('id'), members: [user.get('id')], invites:[] }
    user.set 'party', {current: id, invitation: null, leader: true}
    partySubscribe model, -> $('#party-modal').modal('show')

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
        partySubscribe model

  appExports.partyAccept = ->
    user.set 'party.current', user.get('party.invitation')
    user.set 'party.invitation', null
    partySubscribe model, ->
      p = model.at('_party')
      p.push 'members', user.get('id')

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
    p.set 'members', members
    if (members.length == 0)
      # last member out, kill the party
      model.del "parties.#{id}"
    model.set '_party', null
    model.set '_partyMembers', null
    partyUnsubscribe model
    selfQ = model.query('users').withId(model.get('_userId') or model.session.userId)
    selfQ.subscribe (err, u) ->
      model.ref '_user', u.at(0)
      browser.resetDom model
    #setTimeout (-> window.location.reload true), 1

  #exports.partyDisband = ->
