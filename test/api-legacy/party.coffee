'use strict'

diff = require("deep-diff")

Group = require("../../website/src/models/group").model
app = require("../../website/src/server")

describe "Party", ->
  context "creating a party", ->
    it "creates a party", (done) ->
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

    it "prevents user from creating a second party", (done) ->
      request.post(baseURL + "/groups").send(
        name: "TestGroup"
        type: "party"
      ).end (res) ->
        expectCode res, 400
        expect(res.body.err).to.equal "Already in a party, try refreshing."
        done()

  context "Searching for a party", ->
    group = undefined
    beforeEach (done) ->
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

    it "can be found by querying for group type party", (done) ->
      request.get(baseURL + "/groups/").send(
        type: "party"
      ).end (res) ->
        expectCode res, 200
        party = _.find res.body, (g) -> return g._id == group._id
        expect(party._id).to.equal group._id
        expect(party.leader).to.equal user._id
        expect(party.name).to.equal group.name
        expect(party.quest).to.deep.equal { progress: {} }
        expect(party.memberCount).to.equal group.memberCount
        done()

  context "joining a party", ->
    group = undefined
    beforeEach (done) ->
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

    it "prevents user from joining a party when they haven't been invited", (done) ->
      registerNewUser (err, user) ->
        request.post(baseURL + "/groups/" + group._id + "/join").send()
        .set("X-API-User", user._id)
        .set("X-API-Key", user.apiToken)
        .end (res) ->
          expectCode res, 401
          expect(res.body.err).to.equal "Can't join a group you're not invited to."
          done()
      , false

    it "allows users to join a party when they have been invited", (done) ->
      tmpUser = undefined
      async.waterfall [
        (cb) ->
          registerNewUser(cb, false)

        (user, cb) ->
          tmpUser = user
          inviteURL = baseURL + "/groups/" + group._id + "/invite"
          request.post(inviteURL).send(
            uuids: [tmpUser._id]
          )
          .end ->
            cb()

        (cb) ->
          request.post(baseURL + "/groups/" + group._id + "/join")
          .set("X-API-User", tmpUser._id)
          .set("X-API-Key", tmpUser.apiToken)
          .end (res) ->
            expectCode res, 200
            cb()

        (cb) ->
          Group.findById group._id, (err, grp) ->
            expect(grp.members).to.include(tmpUser._id)
            cb()
      ], done

  context "Quests", ->
    party = undefined
    group = undefined
    participating = []
    notParticipating = []
    beforeEach (done) ->
      # Tavern boss, side-by-side
      Group.update(
        _id: "habitrpg"
      ,
        $set:
          quest:
            key: "dilatory"
            active: true
            progress:
              hp: shared.content.quests.dilatory.boss.hp
              rage: 0
      ).exec()

      # Tally some progress for later. Later we want to test that progress made before the quest began gets
      # counted after the quest starts
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

        (cb) ->
          request.post(baseURL + '/user/tasks').send({
            type: 'daily'
            text: 'daily one'
          }).end (res) ->
            cb()
        (cb) ->
          request.post(baseURL + '/user/tasks').send({
            type: 'daily'
            text: 'daily two'
          }).end (res) ->
            cb()
        (cb) ->
          User.findByIdAndUpdate user._id,
            $set:
              "stats.lvl": 50
          , (err, _user) ->
            cb(null, _user)
        (_user, cb) ->
          user = _user
          request.post(baseURL + "/user/batch-update").send([
            {
              op: "score"
              params:
                direction: "up"
                id: user.dailys[0].id
            }
            {
              op: "score"
              params:
                direction: "up"
                id: user.dailys[0].id
            }
            {
              op: "update"
              body:
                "stats.lvl": 50
            }
          ]).end (res) ->
            user = res.body
            expect(user.party.quest.progress.up).to.be.above 0

            # Invite some members
            async.waterfall [

              # Register new users
              (cb) ->
                registerManyUsers 3, cb

              # Send them invitations
              (_party, cb) ->
                party = _party
                inviteURL = baseURL + "/groups/" + group._id + "/invite"
                async.parallel [
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[0]._id]
                    ).end ->
                      cb2()
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[1]._id]
                    ).end ->
                      cb2()
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[2]._id]
                    ).end (res)->
                      cb2()
                ], cb

              # Accept / Reject
              (results, cb) ->

                # series since they'll be modifying the same group record
                series = _.reduce(party, (m, v, i) ->
                  m.push (cb2) ->
                    request.post(baseURL + "/groups/" + group._id + "/join").set("X-API-User", party[i]._id).set("X-API-Key", party[i].apiToken).end ->
                      cb2()
                  m
                , [])
                async.series series, cb

              # Make sure the invites stuck
              (whatever, cb) ->
                Group.findById group._id, (err, g) ->
                  group = g
                  expect(g.members.length).to.equal 4
                  cb()

            ], ->

              # Start the quest
              async.waterfall [
                (cb) ->
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end (res) ->
                    expectCode res, 400
                    User.findByIdAndUpdate user._id,
                      $set:
                        "items.quests.vice3": 1
                    , cb

                (_user, cb) ->
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end (res) ->
                    expectCode res, 200
                    Group.findById group._id, cb

                (_group, cb) ->
                  expect(_group.quest.key).to.equal "vice3"
                  expect(_group.quest.active).to.equal false
                  request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[0]._id).set("X-API-Key", party[0].apiToken).end ->
                    request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[1]._id).set("X-API-Key", party[1].apiToken).end (res) ->
                      request.post(baseURL + "/groups/" + group._id + "/questReject").set("X-API-User", party[2]._id).set("X-API-Key", party[2].apiToken).end (res) ->
                        group = res.body
                        expect(group.quest.active).to.equal true
                        cb()

              ], done
            ]

    it "Casts a spell", (done) ->
      mp = user.stats.mp
      request.get(baseURL + "/members/" + party[0]._id).end (res) ->
        party[0] = res.body
        request.post(baseURL + "/user/class/cast/snowball?targetType=user&targetId=" + party[0]._id).end (res) ->

          #expect(res.body.stats.mp).to.be.below(mp);
          request.get(baseURL + "/members/" + party[0]._id).end (res) ->
            member = res.body
            expect(member.achievements.snowball).to.equal 1
            expect(member.stats.buffs.snowball).to.exist
            difference = diff(member, party[0])
            expect(_.size(difference)).to.equal 2

            # level up user so str is > 0
            request.put(baseURL + "/user").send("stats.lvl": 5).end (res) ->

              # Refill mana so user can cast
              request.put(baseURL + "/user").send("stats.mp": 100).end (res) ->
                request.post(baseURL + "/user/class/cast/valorousPresence?targetType=party").end (res) ->
                  request.get(baseURL + "/members/" + member._id).end (res) ->
                    expect(res.body.stats.buffs.str).to.be.above 0
                    expect(diff(res.body, member).length).to.equal 1
                    done()

    it "Doesn't include people who aren't participating", (done) ->
      request.get(baseURL + "/groups/" + group._id).end (res) ->
        expect(_.size(res.body.quest.members)).to.equal 3
        done()

    it "allows quest participants to leave quest", (done) ->
      leavingMember = party[1]
      expect(group.quest.members[leavingMember._id]).to.eql(true)

      request.post(baseURL + "/groups/" + group._id + "/questLeave")
        .set("X-API-User", leavingMember._id)
        .set("X-API-Key", leavingMember.apiToken)
        .end (err, res) ->
          expectCode res, 204
          request.get(baseURL + '/groups/party')
            .end (err, res) ->
              expect(res.body.quest.members[leavingMember._id]).to.not.be.ok
              done()

    xit "Hurts the boss", (done) ->
      request.post(baseURL + "/user/batch-update").end (res) ->
        user = res.body
        up = user.party.quest.progress.up
        expect(up).to.be.above 0

        #{op:'score',params:{direction:'up',id:user.dailys[3].id}}, // leave one daily undone so Trapper hurts party
        # set day to yesterday, cron will then be triggered on next action
        request.post(baseURL + "/user/batch-update").send([
          {
            op: "score"
            params:
              direction: "up"
              id: user.dailys[0].id
          }
          {
            op: "update"
            body:
              lastCron: moment().subtract(1, "days")
          }
        ]).end (res) ->
          expect(res.body.party.quest.progress.up).to.be.above up
          request.post(baseURL + "/user/batch-update").end ->
            request.get(baseURL + "/groups/party").end (res) ->

              # Check boss damage
              async.waterfall [
                (cb) ->
                  async.parallel [

                    #tavern boss
                    (cb2) ->
                      Group.findById "habitrpg",
                        quest: 1
                      , (err, tavern) ->
                        expect(tavern.quest.progress.hp).to.be.below shared.content.quests.dilatory.boss.hp
                        expect(tavern.quest.progress.rage).to.be.above 0
                        cb2()

                    # party boss
                    (cb2) ->
                      expect(res.body.quest.progress.hp).to.be.below shared.content.quests.vice3.boss.hp
                      _party = res.body.members
                      expect(_.find(_party,
                        _id: party[0]._id
                      ).stats.hp).to.be.below 50
                      expect(_.find(_party,
                        _id: party[1]._id
                      ).stats.hp).to.be.below 50
                      expect(_.find(_party,
                        _id: party[2]._id
                      ).stats.hp).to.be 50
                      cb2()
                  ], cb

                # Kill the boss
                (whatever, cb) ->
                  async.waterfall [

                    # tavern boss
                    (cb2) ->
                      expect(user.items.pets["MantisShrimp-Base"]).to.not.be.ok()
                      Group.update
                        _id: "habitrpg"
                      ,
                        $set:
                          "quest.progress.hp": 0
                      , cb2

                    # party boss
                    (arg1, arg2, cb2) ->
                      expect(user.items.gear.owned.weapon_special_2).to.not.be.ok()
                      Group.findByIdAndUpdate group._id,
                        $set:
                          "quest.progress.hp": 0
                      , cb2
                  ], cb
                (_group, cb) ->
                  # set day to yesterday, cron will then be triggered on next action
                  request.post(baseURL + "/user/batch-update").send([
                    {
                      op: "score"
                      params:
                        direction: "up"
                        id: user.dailys[1].id
                    }
                    {
                      op: "update"
                      body:
                        lastCron: moment().subtract(1, "days")
                    }
                  ]).end ->
                    cb()

                (cb) ->
                  request.post(baseURL + "/user/batch-update").end (res) ->
                    cb null, res.body

                (_user, cb) ->

                  # need to load the user again, since tavern boss does update after user's cron
                  User.findById _user._id, cb
                (_user, cb) ->
                  user = _user
                  Group.findById group._id, cb
                (_group, cb) ->
                  cummExp = shared.content.quests.vice3.drop.exp + shared.content.quests.dilatory.drop.exp
                  cummGp = shared.content.quests.vice3.drop.gp + shared.content.quests.dilatory.drop.gp

                  #//FIXME check that user got exp, but user is leveling up making the exp check difficult
                  #                      expect(user.stats.exp).to.be.above(cummExp);
                  #                      expect(user.stats.gp).to.be.above(cummGp);
                  async.parallel [

                    # Tavern Boss
                    (cb2) ->
                      Group.findById "habitrpg", (err, tavern) ->

                        #use an explicit get because mongoose wraps the null in an object
                        expect(_.isEmpty(tavern.get("quest"))).to.equal true
                        expect(user.items.pets["MantisShrimp-Base"]).to.equal 5
                        expect(user.items.mounts["MantisShrimp-Base"]).to.equal true
                        expect(user.items.eggs.Dragon).to.equal 2
                        expect(user.items.hatchingPotions.Shade).to.equal 2
                        cb2()

                    # Party Boss
                    (cb2) ->

                      #use an explicit get because mongoose wraps the null in an object
                      expect(_.isEmpty(_group.get("quest"))).to.equal true
                      expect(user.items.gear.owned.weapon_special_2).to.equal true
                      expect(user.items.eggs.Dragon).to.equal 2
                      expect(user.items.hatchingPotions.Shade).to.equal 2

                      # need to fetch users to get updated data
                      async.parallel [
                        (cb3) ->
                          User.findById party[0].id, (err, mbr) ->
                            expect(mbr.items.gear.owned.weapon_special_2).to.equal true
                            cb3()
                        (cb3) ->
                          User.findById party[1].id, (err, mbr) ->
                            expect(mbr.items.gear.owned.weapon_special_2).to.equal true
                            cb3()
                        (cb3) ->
                          User.findById party[2].id, (err, mbr) ->
                            expect(mbr.items.gear.owned.weapon_special_2).to.not.be.ok()
                            cb3()
                      ], cb2
                  ], cb
              ], done
