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
        ).end (err, res) ->
          expectCode res, 200
          group = res.body
          expect(group.members.length).to.equal 1
          expect(group.leader).to.equal user._id
          cb()

    ], done

  chat = undefined

  it "removes a user's chat notifications when user is kicked", (done) ->
    userToRemove = null
    async.waterfall [
      (cb) ->
        registerManyUsers 1, cb

      (members, cb) ->
        userToRemove = members[0]
        request.post(baseURL + "/groups/" + group._id + "/invite").send(
          uuids: [userToRemove._id]
        )
        .end -> cb()

      (cb) ->
        request.post(baseURL + "/groups/" + group._id + "/join")
          .set("X-API-User", userToRemove._id)
          .set("X-API-Key", userToRemove.apiToken)
          .end (err, res) -> cb()

      (cb) ->
        msg = "TestMsg"
        request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg)
          .end (err, res) -> cb()

      (cb) ->
        request.get(baseURL + "/user")
          .set("X-API-User", userToRemove._id)
          .set("X-API-Key", userToRemove.apiToken)
          .end (err, res) ->
            expect(res.body.newMessages[group._id]).to.exist
            cb()

      (cb) ->
        request.post(baseURL + "/groups/" + group._id + "/removeMember?uuid=" + userToRemove._id)
          .end (err, res) -> cb()

      (cb) ->
        request.get(baseURL + "/user")
          .set("X-API-User", userToRemove._id)
          .set("X-API-Key", userToRemove.apiToken)
          .end (err, res) ->
            expect(res.body.newMessages[group._id]).to.not.exist
            cb()
    ], done
