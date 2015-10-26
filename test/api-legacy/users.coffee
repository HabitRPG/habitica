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
          .end (err, res) ->
            expectCode res, 200
            request.get(baseURL + "/user/" + userToDelete._id)
            .end (err, res) ->
              expectCode res, 404
              cb()

      ], done

    context "handle group changes when user cancels", ->
      it "Should choose a new group leader when deleting a user", (done) ->
        userToDelete = undefined
        userToBecomeLeader = undefined
        guildToHaveNewLeader = undefined
        async.waterfall [
          (cb) ->
            registerManyUsers 2, cb

          (_users, cb) ->
            userToDelete = _users[0]
            userToBecomeLeader = _users[1]
            User.findByIdAndUpdate userToDelete._id,
              $set:
                "balance": 4
              , (err, _user) ->
                cb()

          (cb) ->
            request.post(baseURL + "/groups").send(
              name: "GuildToGainNewLeader"
              type: "guild"
            )
            .set("X-API-User", userToDelete._id)
            .set("X-API-Key", userToDelete.apiToken)
            .end (err, res) ->
              expectCode res, 200
              guildToHaveNewLeader = res.body
              expect(guildToHaveNewLeader.leader).to.eql(userToDelete._id)
              cb()

          (cb) ->
            inviteURL = baseURL + "/groups/" + guildToHaveNewLeader._id + "/invite"
            request.post(inviteURL)
              .send( uuids: [userToBecomeLeader._id])
              .end (err, res) ->
                expectCode res, 200
                cb()

          (cb) ->
            request.post(baseURL + "/groups/" + guildToHaveNewLeader._id + "/join")
              .set("X-API-User", userToBecomeLeader._id)
              .set("X-API-Key", userToBecomeLeader.apiToken)
              .end (err, res) ->
                expectCode res, 200
                cb()

          (cb) ->
            request.del(baseURL + "/user")
            .set("X-API-User", userToDelete._id)
            .set("X-API-Key", userToDelete.apiToken)
            .end (err, res) ->
              expectCode res, 200
              cb()

          (cb) ->
            request.get(baseURL + "/groups/" + guildToHaveNewLeader._id)
            .set("X-API-User", userToBecomeLeader._id)
            .set("X-API-Key", userToBecomeLeader.apiToken)
            .end (err, res) ->
              expectCode res, 200
              g = res.body
              userInGroup = _.find(g.members, (member) -> return member._id == userToDelete._id; )
              expect(userInGroup).to.equal(undefined)
              expect(g.leader._id).to.equal(userToBecomeLeader._id)
              cb()

        ], done

      context "handle group and invite removals", ->
        guild = undefined
        party = undefined
        before (done) ->
          User.findByIdAndUpdate user._id,
            $set:
              "balance": 4
            , (err, _user) ->
              async.waterfall [
                (cb) ->
                  request.post(baseURL + "/groups").send(
                    name: "TestPrivateGroup"
                    type: "party"
                  )
                  .end (err, res) ->
                    expectCode res, 200
                    party = res.body
                    cb()

                (cb) ->
                  request.post(baseURL + "/groups").send(
                    name: "TestPrivateGroup"
                    type: "guild"
                  )
                  .end (err, res) ->
                    expectCode res, 200
                    guild = res.body
                    cb()

              ], done

        it 'Should remove a user from a group when deleting a user', (done) ->
          userToDelete = undefined
          async.waterfall [
            (cb) ->
              registerManyUsers 1, cb

            # Send them invitations
            (_users, cb) ->
              userToDelete = _users[0]
              inviteURL = baseURL + "/groups/" + party._id + "/invite"
              request.post(inviteURL)
                .send( uuids: [userToDelete._id])
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              inviteURL = baseURL + "/groups/" + guild._id + "/invite"
              request.post(inviteURL)
                .send( uuids: [userToDelete._id])
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              request.post(baseURL + "/groups/" + party._id + "/join")
                .set("X-API-User", userToDelete._id)
                .set("X-API-Key", userToDelete.apiToken)
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              request.post(baseURL + "/groups/" + guild._id + "/join")
                .set("X-API-User", userToDelete._id)
                .set("X-API-Key", userToDelete.apiToken)
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              request.del(baseURL + "/user")
              .set("X-API-User", userToDelete._id)
              .set("X-API-Key", userToDelete.apiToken)
              .end (err, res) ->
                expectCode res, 200
                cb()

            (cb) ->
              request.get(baseURL + "/groups/" + party._id)
              .end (err, res) ->
                expectCode res, 200
                g = res.body
                userInGroup = _.find(g.members, (member) -> return member._id == userToDelete._id; )
                expect(userInGroup).to.equal(undefined)
                cb()

            (cb) ->
              request.get(baseURL + "/groups/" + guild._id)
              .end (err, res) ->
                expectCode res, 200
                g = res.body
                userInGroup = _.find(g.members, (member) -> return member._id == userToDelete._id; );
                expect(userInGroup).to.equal(undefined)
                cb()

          ], done

        it 'Should remove invitations when deleting a user', (done) ->
          userToDeleteInvites = undefined
          async.waterfall [
            (cb) ->
              registerManyUsers 1, cb

            # Send them invitations
            (_users, cb) ->
              userToDeleteInvites = _users[0]
              inviteURL = baseURL + "/groups/" + party._id + "/invite"
              request.post(inviteURL)
                .send( uuids: [userToDeleteInvites._id])
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              inviteURL = baseURL + "/groups/" + guild._id + "/invite"
              request.post(inviteURL)
                .send( uuids: [userToDeleteInvites._id])
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              request.del(baseURL + "/user")
              .set("X-API-User", userToDeleteInvites._id)
              .set("X-API-Key", userToDeleteInvites.apiToken)
              .end (err, res) ->
                expectCode res, 200
                cb()

            (cb) ->
              request.get(baseURL + "/groups/" + party._id)
              .end (err, res) ->
                expectCode res, 200
                g = res.body
                userInviteForGroup = _.find(g.invites, (invite) -> return invite._id == userToDeleteInvites._id; )
                expect(userInviteForGroup).to.equal(undefined)
                cb()

            (cb) ->
              request.get(baseURL + "/groups/" + guild._id)
              .end (err, res) ->
                expectCode res, 200
                g = res.body
                userInviteForGroup = _.find(g.invites, (invite) -> return invite._id == userToDeleteInvites._id; )
                expect(userInviteForGroup).to.equal(undefined)
                cb()

          ], done
