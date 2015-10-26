'use strict'

app = require("../../website/src/server")

describe "GET /api/v2/user/anonymized", ->

  anon = null

  before (done) ->
    # TODO: Seed user with messages, rewards, dailys, checklists, webhooks, etc
    registerNewUser ->
      request.get(baseURL + "/user/anonymized")
        .end (err, res) ->
          anon = res.body
          done()
    , true

  it 'retains user id', (done) ->
    expect(anon._id).to.equal user._id
    done()

  it 'removes credentials and financial information', (done) ->
    expect(anon.apiToken).to.not.exist
    expect(anon.auth.local).to.not.exist
    expect(anon.auth.facebook).to.not.exist
    expect(anon.purchased.plan).to.not.exist
    done()

  it 'removes profile information', (done) ->
    expect(anon.profile).to.not.exist
    expect(anon.contributor).to.not.exist
    expect(anon.achievements.challenges).to.not.exist
    done()

  it 'removes social information', (done) ->
    expect(anon.newMessages).to.not.exist
    expect(anon.invitations).to.not.exist
    expect(anon.items.special.nyeReceived).to.not.exist
    expect(anon.items.special.valentineReceived).to.not.exist
    _(anon.inbox.messages).each (msg) ->
      expect(msg).to.equal 'inbox message text'
    done()

  it 'removes webhooks', (done) ->
    expect(anon.webhooks).to.not.exist
    done()

  it 'anonymizes task info', (done) ->
    _(['habits', 'todos', 'dailys', 'rewards']).each (tasks) ->
      _(anon[tasks]).each (task) ->
        expect(task.text).to.equal 'task text'
        expect(task.notes).to.equal 'task notes'
        checklist_count = 0
        _(task.checklist).each (box) ->
          box.text = 'item' + checklist_count++
    done()

  it 'anonymizes tags', (done) ->
    _(anon.tags).each (tag) ->
      expect(tag.name).to.equal 'tag'
      expect(tag.challenge).to.equal 'challenge'
    done()
