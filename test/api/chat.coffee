'use strict'

diff = require("deep-diff")

Group = require("../../website/src/models/group").model
app = require("../../website/src/server")

describe "Chat", ->
  group = undefined
  before (done) ->
    async.waterfall [
      (cb) ->
        registerNewUser(cb, true)

      (user, cb) ->
        request.post(baseURL + "/groups").send(
          name: "TestGroup"
          type: "party"
        ).end (res) ->
          expectCode res, 200
          group = res.body
          expect(group.members.length).to.equal 1
          expect(group.leader).to.equal user._id
          cb()

    ], done

  chat = undefined
  it "Posts a message to party chat", (done) ->
    msg = "TestMsg"
    request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg).send(
    ).end (res) ->
      expectCode res, 200
      chat = res.body.message
      expect(chat.id).to.be.ok
      expect(chat.text).to.equal msg
      expect(chat.timestamp).to.be.ok
      expect(chat.likes).to.be.empty
      expect(chat.flags).to.be.empty
      expect(chat.flagCount).to.equal 0
      expect(chat.uuid).to.be.ok
      expect(chat.contributor).to.be.empty
      expect(chat.backer).to.be.empty
      expect(chat.uuid).to.equal user._id
      expect(chat.user).to.equal user.profile.name
      done()

  it "Does not post an empty message", (done) ->
    msg = ""
    request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg).send(
    ).end (res) ->
      expectCode res, 400
      expect(res.body.err).to.equal 'You cannot send a blank message'
      done()

  it "can not like own chat message", (done) ->
    request.post(baseURL + "/groups/" + group._id + "/chat/" + chat.id + "/like").send(
    ).end (res) ->
      expectCode res, 401
      body = res.body
      expect(body.err).to.equal "Can't like your own message. Don't be that person."
      done()

  it "can not flag own message", (done) ->
    request.post(baseURL + "/groups/" + group._id + "/chat/" + chat.id + "/flag").send(
    ).end (res) ->
      expectCode res, 401
      body = res.body
      expect(body.err).to.equal "Can't report your own message."
      done()

  it "Gets chat messages from party chat", (done) ->
    request.get(baseURL + "/groups/" + group._id + "/chat").send(
    ).end (res) ->
      expectCode res, 200
      message = res.body[0]
      expect(message.id).to.equal chat.id
      expect(message.timestamp).to.equal chat.timestamp
      expect(message.likes).to.deep.equal chat.likes
      expect(message.flags).to.deep.equal chat.flags
      expect(message.flagCount).to.equal chat.flagCount
      expect(message.uuid).to.equal chat.uuid
      expect(message.contributor).to.deep.equal chat.contributor
      expect(message.backer).to.deep.equal chat.backer
      expect(message.user).to.equal chat.user
      done()

  it "Deletes a chat messages from party chat", (done) ->
    request.del(baseURL + "/groups/" + group._id + "/chat/" + chat.id).send(
    ).end (res) ->
      expectCode res, 204
      expect(res.body).to.be.empty
      done()

  it "Can not delete already deleted message", (done) ->
    request.del(baseURL + "/groups/" + group._id + "/chat/" + chat.id).send(
    ).end (res) ->
      expectCode res, 404
      body = res.body
      expect(body.err).to.equal "Message not found!"
      done()
