'use strict'

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
          expect(_user.pushDevices.length).to.be 1
          expect(_user.pushDevices[0].regId).to.be "123123"

          done()

  describe "Events that send push notifications", ->

    pushSpy = sinon.spy()

    context "Challenges", ->

      it "sends a push notification when you win a challenge"

      it "does not send a push notification when you lose a challenge"

    context "Groups", ->

      it "sends a push notification when invited to a guild"

      it "sends a push notification when invited to a party"

      it "sends a push notification when invited to a quest"

    context "Gifts", ->
      recipient = null
      members = rewire("../../website/src/controllers/members")
      members.__set__('pushNotify', pushSpy)
      members.sendMessage = -> true

      before (done) ->
        registerNewUser (err, _user) ->
          recipient = _user
          user.balance = 4
          members.__set__ 'fetchMember', (id) -> return (cb) -> cb(null, recipient)
          done()
        , false


      it "sends a push notification when gifted gems", (done) ->
        req = { 
          params: { uuid: "uuid" },
          body: { 
            type: 'gems',
            gems: { amount: 1 }
          } 
        }
        res = { locals: { user: user } }

        members.sendGift req, res

        expect(pushSpy.calledOnce).to.be.ok

        done()

      it "sends a push notification when gifted a subscription"
