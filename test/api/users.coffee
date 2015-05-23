'use strict'

User = require("../../website/src/models/user").model
app = require("../../website/src/server")

describe "Users", ->

  describe "Deleting Users", ->

    before (done) ->
      registerNewUser ->
        done()
      , true

    it 'Should delete a user', (done) ->
      async.waterfall [
        (cb) ->
          registerManyUsers 1, cb

        (_userToDelete, cb) ->
          userToDelete = _userToDelete[0]
          request.del(baseURL + "/user")
          .set("X-API-User", userToDelete._id)
          .set("X-API-Key", userToDelete.apiToken)
          .end (res) ->
            expectCode res, 200
            cb()

      ], done

    it 'Should remove a user from a group when deleting a user', (done) ->
      userToDelete = undefined
      group = undefined
      User.findByIdAndUpdate user._id,
        $set:
          "balance": 4
        , (err, _user) ->
          request.post(baseURL + "/groups").send(
            name: "TestPrivateGroup"
            type: "party"
          )
          .end (res) ->
            expectCode res, 200
            group = res.body
            console.log(user._id)
            #Add members to guild
            async.waterfall [
              (cb) ->
                registerManyUsers 1, cb

              # Send them invitations
              (_users, cb) ->
                userToDelete = _users[0]
                inviteURL = baseURL + "/groups/" + group._id + "/invite"
                request.post(inviteURL)
                  .send( uuids: [userToDelete._id])
                  .end ->
                    expectCode res, 200
                    cb()

              (cb) ->
                request.post(baseURL + "/groups/" + group._id + "/join")
                  .set("X-API-User", userToDelete._id)
                  .set("X-API-Key", userToDelete.apiToken)
                  .end ->
                    expectCode res, 200
                    cb()

              (cb) ->
                request.del(baseURL + "/user")
                .set("X-API-User", userToDelete._id)
                .set("X-API-Key", userToDelete.apiToken)
                .end (res) ->
                  expectCode res, 200
                  cb()

              (cb) ->
                request.get(baseURL + "/groups/" + group._id)
                .end (res) ->
                  expectCode res, 200
                  g = res.body
                  userInGroup = _.find(g.members, (member) -> return member._id == userToDelete._id; );
                  expect(userInGroup).to.equal(undefined)
                  cb()

            ], done
