'use strict'

diff = require("deep-diff")

Group = require("../../website/src/models/group").model
app = require("../../website/src/server")

describe.skip "Guilds", ->
  context "leaving groups", ->
    it "can leave a guild", (done) ->
      guildToLeave = undefined
      request.post(baseURL + "/groups").send(
        name: "TestGroupToLeave"
        type: "guild"
      ).end (err, res) ->
        guildToLeave = res.body
        request.post(baseURL + "/groups/" + guildToLeave._id + "/leave")
        .send()
        .end (err, res) ->
          expectCode res, 204
          done()

    it "deletes a group when the last member leaves", (done) ->
      groupToDeleteAfterLeave = undefined
      request.post(baseURL + "/groups").send(
        name: "TestGroupToDeleteAfteLeave"
        type: "guild"
        privacy: "private"
      ).end (err, res) ->
        groupToDeleteAfterLeave = res.body
        async.waterfall [
          (cb) ->
            request.post(baseURL + "/groups/" + groupToDeleteAfterLeave._id + "/leave")
            .end (err, res) ->
              expectCode res, 204
              cb()

          (cb) ->
            request.post(baseURL + "/groups/" + groupToDeleteAfterLeave._id)
            .end (err, res) ->
              expectCode res, 404
              cb()
        ], done

    it "deletes all invites to a group (guild) when the last member leaves", (done) ->
      groupToDeleteAfterLeave = undefined
      userToRemoveInvite = undefined
      request.post(baseURL + "/groups").send(
        name: "TestGroupToDeleteAfterLeave"
        type: "guild"
        privacy: "private"
      ).end (err, res) ->
        groupToDeleteAfterLeave = res.body
        async.waterfall [
          (cb) ->
            registerManyUsers 1, cb

          (_members, cb) ->
            userToRemoveInvite = _members[0]
            inviteURL = baseURL + "/groups/" + groupToDeleteAfterLeave._id + "/invite"
            request.post(inviteURL).send(
              uuids: [userToRemoveInvite._id]
            )
            .end ->
              cb()

          (cb) ->
            request.post(baseURL + "/groups/" + groupToDeleteAfterLeave._id + "/leave")
            .end (err, res) ->
              expectCode res, 204
              cb()

          (cb) ->
            request.get(baseURL + '/user')
              .set("X-API-User", userToRemoveInvite._id)
              .set("X-API-Key", userToRemoveInvite.apiToken)
              .end (err, res) ->
                expectCode res, 200
                groupInvitation = _.find(res.body.invitations.guilds, {id: groupToDeleteAfterLeave._id})
                expect(groupInvitation).to.not.exist
                cb()

          (cb) ->
            request.post(baseURL + "/groups/" + groupToDeleteAfterLeave._id)
            .end (err, res) ->
              expectCode res, 404
              cb()
        ], done

    it "deletes all invites to a group (party) when the last member leaves", (done) ->
      partyToDeleteAfterLeave = undefined
      userToRemovePartyInvite = undefined
      request.post(baseURL + "/groups").send(
        name: "TestPartyToDeleteAfterLeave"
        type: "party"
      ).end (err, res) ->
        partyToDeleteAfterLeave = res.body
        async.waterfall [
          (cb) ->
            registerManyUsers 1, cb

          (_members, cb) ->
            userToRemovePartyInvite = _members[0]
            inviteURL = baseURL + "/groups/" + partyToDeleteAfterLeave._id + "/invite"
            request.post(inviteURL).send(
              uuids: [userToRemovePartyInvite._id]
            )
            .end ->
              cb()

          (cb) ->
            request.post(baseURL + "/groups/" + partyToDeleteAfterLeave._id + "/leave")
            .end (err, res) ->
              expectCode res, 204
              cb()

          (cb) ->
            request.get(baseURL + '/user')
              .set("X-API-User", userToRemovePartyInvite._id)
              .set("X-API-Key", userToRemovePartyInvite.apiToken)
              .end (err, res) ->
                expectCode res, 200
                party = partyToDeleteAfterLeave
                partyInvitation = _.find(res.body.invitations.party, (invite) ->
                  return invite == party._id
                )
                expect(partyInvitation).to.not.exist
                cb()

          (cb) ->
            request.post(baseURL + "/groups/" + partyToDeleteAfterLeave._id)
            .end (err, res) ->
              expectCode res, 404
              cb()
        ], done

  context "removing users groups", ->
    it "allows guild leaders to remove a member (but not themselves)", (done) ->
      guildToRemoveMember = undefined
      members = undefined
      userToRemove = undefined
      request.post(baseURL + "/groups").send(
        name: "TestGuildToRemoveMember"
        type: "guild"
      ).end (err, res) ->
        guildToRemoveMember = res.body
        #Add members to guild
        async.waterfall [
          (cb) ->
            registerManyUsers 1, cb

          (_members, cb) ->
            userToRemove = _members[0]
            members = _members
            inviteURL = baseURL + "/groups/" + guildToRemoveMember._id + "/invite"
            request.post(inviteURL).send(
              uuids: [userToRemove._id]
            )
            .end ->
              cb()

          (cb) ->
            request.post(baseURL + "/groups/" + guildToRemoveMember._id + "/join")
              .set("X-API-User", userToRemove._id)
              .set("X-API-Key", userToRemove.apiToken)
              .end (err, res) ->
                cb()
          (cb) ->
            request.post(baseURL + "/groups/" + guildToRemoveMember._id + "/removeMember?uuid=" + guildToRemoveMember.leader)
            .send().end (err, res) ->
              expectCode res, 401
              cb()

          (cb) ->
            request.post(baseURL + "/groups/" + guildToRemoveMember._id + "/removeMember?uuid=" + userToRemove._id)
            .send().end (err, res) ->
              expectCode res, 204
              cb()

          (cb) ->
            request.get(baseURL + "/groups/" + guildToRemoveMember._id)
            .send()
            .end (err, res) ->
              g = res.body
              userInGroup = _.find g.members, (member) -> return member._id == userToRemove._id
              expect(userInGroup).to.not.exist
              cb()

        ], done

  describe "Private Guilds", ->
    guild = undefined
    before (done) ->
      request.post(baseURL + "/groups").send(
        name: "TestPrivateGroup"
        type: "guild"
        privacy: "private"
      ).end (err, res) ->
        expectCode res, 200
        guild = res.body
        expect(guild.members.length).to.equal 1
        expect(guild.leader).to.equal user._id
        #Add members to guild
        async.waterfall [
          (cb) ->
            registerManyUsers 15, cb

          (_members, cb) ->
            members = _members

            joinGuild = (member, callback) ->
              request.post(baseURL + "/groups/" + guild._id + "/join")
                .set("X-API-User", member._id)
                .set("X-API-Key", member.apiToken)
                .end ->
                  callback(null, null)

            async.map members, joinGuild, (err, results) -> cb()

        ], done

    it "includes user in private group member list when user is a member", (done) ->

      request.get(baseURL + "/groups/" + guild._id)
      .end (err, res) ->
        g = res.body
        userInGroup = _.find g.members, (member) -> return member._id == user._id
        expect(userInGroup).to.exist
        done()

    it "excludes user from viewing private group member list when user is not a member", (done) ->

      request.post(baseURL + "/groups/" + guild._id + "/leave")
        .end (err, res) ->
          request.get(baseURL + "/groups/" + guild._id)
          .end (err, res) ->
            expect res, 404
            done()

  describe "Public Guilds", ->
    before (done) ->
      async.waterfall [
        (cb) ->
          registerNewUser ->
            User.findByIdAndUpdate user._id, {$set: { "balance": 10 } }, (err, _user) ->
              cb()
          , true
      ], done

    context "joining groups", ->
      it "makes user a group leader when group is empty", (done) ->
        guildToEmptyAndAssignLeader = undefined
        members = undefined
        userToBecomeLeader = undefined
        request.post(baseURL + "/groups").send(
          name: "TestGuildToEmptyAndAssignLeader"
          type: "guild",
          privacy: "public"
        ).end (err, res) ->
          guildToEmptyAndAssignLeader = res.body
          #Add members to guild
          async.waterfall [
            (cb) ->
              registerManyUsers 1, cb

            (_members, cb) ->
              userToBecomeLeader = _members[0]
              members = _members
              inviteURL = baseURL + "/groups/" + guildToEmptyAndAssignLeader._id + "/invite"
              request.post(inviteURL).send(
                uuids: [userToBecomeLeader._id]
              )
              .end ->
                cb()

            (cb) ->
              request.post(baseURL + "/groups/" + guildToEmptyAndAssignLeader._id + "/leave")
                .send()
                .end (err, res) ->
                  expectCode res, 204
                  cb()

            (cb) ->
              request.post(baseURL + "/groups/" + guildToEmptyAndAssignLeader._id + "/join")
                .set("X-API-User", userToBecomeLeader._id)
                .set("X-API-Key", userToBecomeLeader.apiToken)
                .end (err, res) ->
                  expectCode res, 200
                  cb()

            (cb) ->
              request.get(baseURL + "/groups/" + guildToEmptyAndAssignLeader._id)
              .set("X-API-User", userToBecomeLeader._id)
              .set("X-API-Key", userToBecomeLeader.apiToken)
              .send()
              .end (err, res) ->
                expectCode res, 200
                g = res.body
                expect(g.leader._id).to.equal(userToBecomeLeader._id)
                cb()

          ], done

    context "viewing", ->
      guild = undefined
      before (done) ->
        async.waterfall [
          (cb) ->
            registerNewUser ->
              User.findByIdAndUpdate user._id, {$set: { "balance": 10 } }, (err, _user) ->
                cb()
            , true
          (cb) ->
            request.post(baseURL + "/groups").send(
              name: "TestPublicGroup"
              type: "guild"
              privacy: "public"
            ).end (err, res) ->
              guild = res.body
              expect(guild.members.length).to.equal 1
              expect(guild.leader).to.equal user._id
              #Add members to guild
              cb()

          (cb) ->
            registerManyUsers 15, cb

          (_members, cb) ->
            members = _members

            joinGuild = (member, callback) ->
              request.post(baseURL + "/groups/" + guild._id + "/join")
                .set("X-API-User", member._id)
                .set("X-API-Key", member.apiToken)
                .end ->
                  callback(null, null)

            async.map members, joinGuild, (err, results) -> cb()

        ], done

      context "is a member", ->
        before (done) ->
          registerNewUser ->
            request.post(baseURL + "/groups/" + guild._id + "/join")
              .end (err, res)->
                done()
          , true

        it "includes user in public group member list", (done) ->
          request.get(baseURL + "/groups/" + guild._id)
            .end (err, res) ->
              g = res.body
              expect(g.members.length).to.equal 15
              userInGroup = _.find g.members, (member) -> return member._id == user._id
              expect(userInGroup).to.exist
              done()

      context "is not a member", ->
        before (done) ->
          registerNewUser done, true

        it "excludes user in public group member list", (done) ->
          request.get(baseURL + "/groups/" + guild._id)
            .end (err, res) ->
              g = res.body
              expect(g.members.length).to.equal 15
              userInGroup = _.find g.members, (member) -> return member._id == user._id
              expect(userInGroup).to.not.exist
              done()
