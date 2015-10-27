'use strict'

require('../../website/src/server')

describe 'User', ->

  before (done) ->
    registerNewUser done, true

  describe 'GET /user', ->
    it 'removes password from user object', (done) ->
      request.get(baseURL + '/user')
        .end (err, res) ->
          expectCode res, 200
          localAuth = res.body.auth.local
          expect(localAuth.hashed_password).to.not.exist
          expect(localAuth.salt).to.not.exist
          done()

    it 'removes apiToken from user object', (done) ->
      request.get(baseURL + '/user')
        .end (err, res) ->
          expectCode res, 200
          expect(res.body.apiToken).to.not.exist
          done()
