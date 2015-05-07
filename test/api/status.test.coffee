'use strict'
#jslint node: true

#global describe, before, beforeEach, it

app = require("../../website/src/server")

describe "API", ->

  before (done) ->
    require "../../website/src/server" # start the server
    # then wait for it to do it's thing. TODO make a cb-compatible export of server
    setTimeout done, 2000

  describe "Without token or user id", ->

    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 200
        expect(res.body.status).to.be "up"
        done()

    it "/api/v2/user", (done) ->
      request
        .get(baseURL + "/user")
        .set("Accept", "application/json")
        .set("X-API-User", '')
        .set("X-API-Key", '')
        .end (res) ->
          expect(res.statusCode).to.be 401
          expect(res.body.err).to.be "You must include a token and uid (user id) in your request"
          done()

  describe "With token or user id", ->
    before (done) ->
      registerNewUser(done, true)

    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 200
        expect(res.body.status).to.be "up"
        done()

    it "/api/v2/user", (done) ->
      request.get(baseURL + "/user").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 200
        expect(res.body._id).to.be user._id
        done()
