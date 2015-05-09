'use strict'

app = require("../../website/src/server")

describe "Site Status", ->

  before (done) ->
    registerNewUser(done, true)

  describe "Anonymized User", ->
    it "/api/v2/user/anonymized", (done) ->
      request.get(baseURL + "/user/anonymized").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 200
        done()
