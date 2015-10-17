'use strict'

app = require("../../website/src/server")

describe "Site Status", ->

  describe "GET /status", ->

    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.equal 200
        expect(res.body.status).to.equal "up"
        done()
