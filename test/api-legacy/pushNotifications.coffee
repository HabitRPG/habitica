'use strict'
#@TODO: Have to mock most things to get to the parts that
#call pushNotify. Consider refactoring group controller
#so things are easier to test

app = require("../../website/src/server")
rewire = require('rewire')
sinon = require('sinon')

describe "Push-Notifications", ->
  before (done) ->
    registerNewUser(done, true)

  describe "POST /user/pushDevice", ->
    it "Registers a DeviceID", (done) ->
      request.post(baseURL + "/user/pushDevice").send(
        { regId: "123123", type: "android"}
      ).end (res) ->
        expectCode res, 200

        User.findOne
          _id: global.user._id
        , (err, _user) ->
          expect(_user.pushDevices.length).to.equal 1
          expect(_user.pushDevices[0].regId).to.equal "123123"

          done()

  describe "Events that send push notifications", ->
    pushSpy = { sendNotify: sinon.spy() }

    afterEach (done) ->
      pushSpy.sendNotify.reset()
      done()

    context "Challenges", ->
      challenges = rewire("../../website/src/controllers/challenges")
      challenges.__set__('pushNotify', pushSpy)
      challengeMock = {
        findById: (arg, cb) ->
          cb(null, {leader: user._id, name: 'challenge-name'})
      }
      userMock = {
        findById: (arg, cb) ->
          cb(null, user)
      }

      challenges.__set__('Challenge', challengeMock)
      challenges.__set__('User', userMock)
      challenges.__set__('closeChal', -> true)

      beforeEach (done) ->
        registerNewUser ->
          user.preferences.emailNotifications.wonChallenge = false
          user.save = (cb) -> cb(null, user)
          done()
        , true

      it "sends a push notification when you win a challenge", (done) ->
        req = {
          params: { cid: 'challenge-id' }
          query: {uid: 'user-id'}
        }
        res = {
          locals: { user: user }
        }
        challenges.selectWinner req, res

        setTimeout -> # Allow selectWinner to finish
          expect(pushSpy.sendNotify).to.have.been.calledOnce
          expect(pushSpy.sendNotify).to.have.been.calledWith(
            user,
            'You Won a Challenge',
            'challenge-name'
          )
          done()
        , 100

    context "Groups", ->

      recipient = null

      groups = rewire("../../website/src/controllers/groups")
      groups.__set__('pushNotify', pushSpy)

      before (done) ->
        registerNewUser (err,_user)->
          recipient = _user
          recipient.invitations.guilds = []
          recipient.save = (cb) -> cb(null, recipient)
          recipient.preferences.emailNotifications.invitedGuild = false
          recipient.preferences.emailNotifications.invitedParty = false
          recipient.preferences.emailNotifications.invitedQuest = false
          userMock = {
            findById: (arg, cb) ->
              cb(null, recipient)
            find: (arg, arg2, cb) ->
              cb(null, [recipient])
            update: (arg, arg2) ->
              { exec: -> true}
          }
          groups.__set__('User', userMock)
          done()

        , false

      it "sends a push notification when invited to a guild", (done) ->
        group = { _id: 'guild-id', name: 'guild-name', type: 'guild', members: [user._id], invites: [] }
        group.save = (cb) -> cb(null, group)
        req = {
          body: { uuids: [recipient._id] }
        }
        res = {
          locals: { group: group, user: user }
          json: -> return true
        }

        groups.invite req, res

        setTimeout -> # Allow invite to finish
          expect(pushSpy.sendNotify).to.have.been.calledOnce
          expect(pushSpy.sendNotify).to.have.been.calledWith(
            recipient,
            'Invited To Guild',
            group.name
          )
          done()
        , 100

      it "sends a push notification when invited to a party", (done) ->
        group = { _id: 'party-id', name: 'party-name', type: 'party', members: [user._id], invites: [] }
        group.save = (cb) -> cb(null, group)
        req = {
          body: { uuids: [recipient._id] }
        }
        res = {
          locals: { group: group, user: user }
          json: -> return true
        }

        groups.invite req, res

        setTimeout -> # Allow invite to finish
          expect(pushSpy.sendNotify).to.have.been.calledOnce
          expect(pushSpy.sendNotify).to.have.been.calledWith(
            recipient,
            'Invited To Party',
            group.name
          )
          done()
        , 100

      it "sends a push notification when invited to a quest", (done) ->
        group = { _id: 'party-id', name: 'party-name', type: 'party', members: [user._id, recipient._id], invites: [], quest: {}}
        user.items.quests.hedgehog = 5
        group.save = (cb) -> cb(null, group)
        group.markModified = -> true
        req = {
          body: { uuids: [recipient._id] }
          query: { key: 'hedgehog' }
        }
        res = {
          locals: { group: group, user: user }
          json: -> return true
        }

        groups.questAccept req, res

        setTimeout -> # Allow questAccept to finish
          expect(pushSpy.sendNotify).to.have.been.calledOnce
          expect(pushSpy.sendNotify).to.have.been.calledWith(
            recipient,
            'Quest Invitation',
            'Invitation for the Quest The Hedgebeast'
          )
          done()
        , 100

      it "sends a push notification to participating members when quest starts", (done) ->
        group = { _id: 'party-id', name: 'party-name', type: 'party', members: [user._id, recipient._id], invites: []}
        group.quest = {
          key: 'hedgehog'
          progress: { hp: 100 }
          members: {}
        }
        group.quest.members[recipient._id] = true
        group.save = (cb) -> cb(null, group)
        group.markModified = -> true
        req = {
          body: { uuids: [recipient._id] }
          query: { }
          # force: true
        }
        res = {
          locals: { group: group, user: user }
          json: -> return true
        }
        userMock = {
          findOne: (arg, arg2, cb) ->
            cb(null, recipient)
          update: (arg, arg2, cb) ->
            if (cb)
              return cb(null, user)
            else
              return {
                exec: -> true 
              }
        }
        groups.__set__('User', userMock)
        groups.__set__('populateQuery', 
          (arg, arg2, arg3) -> 
            return {
              exec: -> group.members
            }
        )

        groups.questAccept req, res

        setTimeout -> # Allow questAccept to finish
          expect(pushSpy.sendNotify).to.have.been.calledTwice
          expect(pushSpy.sendNotify).to.have.been.calledWith(
            recipient,
            'HabitRPG', 
            'Your Quest has Begun: The Hedgebeast'
          )
          done()
        , 100

    describe "Gifts", ->

      recipient = null

      before (done) ->
        registerNewUser (err, _user) ->
          recipient = _user
          recipient.preferences.emailNotifications.giftedGems = false
          user.balance = 4
          user.save = -> return true
          recipient.save = -> return true
          done()
        , false

      context "sending gems from balance", ->
        members = rewire("../../website/src/controllers/members")
        members.sendMessage = -> true

        members.__set__('pushNotify', pushSpy)
        members.__set__ 'fetchMember', (id) ->
          return (cb) -> cb(null, recipient)

        it "sends a push notification", (done) ->
          req = {
            params: { uuid: "uuid" },
            body: {
              type: 'gems',
              gems: { amount: 1 }
            }
          }
          res = { locals: { user: user } }

          members.sendGift req, res

          setTimeout -> # Allow sendGift to finish
            expect(pushSpy.sendNotify).to.have.been.calledOnce
            expect(pushSpy.sendNotify).to.have.been.calledWith(
              recipient,
              'Gifted Gems',
              '1 Gems - by ' + user.profile.name
            )
            done()
          , 100

      describe "Purchases", ->

        payments = rewire("../../website/src/controllers/payments")

        payments.__set__('pushNotify', pushSpy)
        membersMock = { sendMessage: -> true }
        payments.__set__('members', membersMock)

        context "buying gems as a purchased gift", ->

          it "sends a push notification", (done) ->
            data = {
              user: user,
              gift: {
                member: recipient,
                gems: { amount: 1 }
              }
            }

            payments.buyGems data

            setTimeout -> # Allow buyGems to finish
              expect(pushSpy.sendNotify).to.have.been.calledOnce
              expect(pushSpy.sendNotify).to.have.been.calledWith(
                recipient,
                'Gifted Gems',
                '1 Gems - by ' + user.profile.name
              )

              done()
            , 100

          it "does not send a push notification if buying gems for self", (done) ->
            data = {
              user: user,
              gift: {
                member: user
                gems: { amount: 1 }
              }
            }

            payments.buyGems data

            setTimeout -> # Allow buyGems to finish
              expect(pushSpy.sendNotify).to.not.have.been.called

              done()
            , 100

        context "sending a subscription as a purchased gift", ->

          it "sends a push notification", (done) ->
            data = {
              user: user,
              gift: {
                member: recipient
                subscription: { key: 'basic_6mo' }
              }
            }

            payments.createSubscription data

            setTimeout -> # Allow createSubscription to finish
              expect(pushSpy.sendNotify).to.have.been.calledOnce
              expect(pushSpy.sendNotify).to.have.been.calledWith(
                recipient,
                'Gifted Subscription',
                '6 months - by ' + user.profile.name
              )

              done()
            , 100

          it "does not send a push notification if buying subscription for self", (done) ->
            data = {
              user: user,
              gift: {
                member: user
                subscription: { key: 'basic_6mo' }
              }
            }

            payments.createSubscription data

            setTimeout -> # Allow buyGems to finish
              expect(pushSpy.sendNotify).to.not.have.been.called

              done()
            , 100
