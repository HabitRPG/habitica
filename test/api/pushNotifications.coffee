'use strict'

app = require("../../website/src/server")

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
