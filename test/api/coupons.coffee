'use strict'

app = require("../../website/src/server")
Coupon = require("../../website/src/models/coupon").model

makeSudoUser = (usr, cb) ->
  registerNewUser ->
    sudoUpdate = { "$set" : { "contributor.sudo" : true } }
    User.findByIdAndUpdate user._id, sudoUpdate, (err, _user) ->
      usr = _user
      cb()
  , true

describe "Coupons", ->
  before (done) ->
    async.parallel [
      (cb) ->
        mongoose.connection.collections['coupons'].drop (err) ->
          cb()
      (cb) ->
        mongoose.connection.collections['users'].drop (err) ->
          cb()
    ], done

  coupons = null

  describe "POST /api/v2/coupons/generate/:event", ->

    context "while sudo user", ->
      before (done) ->
        makeSudoUser(user, done)

      it "generates coupons", (done) ->
        queries = '?count=10'
        request
          .post(baseURL + '/coupons/generate/wondercon' + queries)
          .end (res) ->
            expectCode res, 200
            Coupon.find { event: 'wondercon' }, (err, _coupons) ->
              coupons = _coupons
              expect(coupons.length).to.be.eql 10
              _(coupons).each (c)->
                expect(c.event).to.be.eql 'wondercon'
              done()

    context "while regular user", ->

      before (done) ->
        registerNewUser(done, true)

      it "does not generate coupons", (done) ->
        queries = '?count=10'
        request
          .post(baseURL + '/coupons/generate/wondercon' + queries)
          .end (res) ->
            expectCode res, 401
            expect(res.body.err).to.be.eql 'You don\'t have admin access'
            done()

  describe "GET /api/v2/coupons", ->

    context "while sudo user", ->
  
      before (done) ->
        makeSudoUser(user, done)

      it "gets coupons", (done) ->
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken
        request
          .get(baseURL + '/coupons' + queries)
          .end (res) ->
            expectCode res, 200
            codes = res.text
            expect(codes).to.contain('code')
            # Expect each coupon code _id to exist in response
            _(coupons).each (c) -> expect(codes).to.contain(c._id)

            done()

      it "gets first 5 coupons out of 10 when a limit of 5 is set", (done) ->
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken + '&limit=5'
        request
          .get(baseURL + '/coupons' + queries)
          .end (res) ->
            expectCode res, 200
            codes = res.text
            sortedCoupons = _.sortBy(coupons, 'seq')
            firstHalf = sortedCoupons[0..4]
            secondHalf = sortedCoupons[5..9]

            # First five coupons should be present in codes
            _(firstHalf).each (c) -> expect(codes).to.contain(c._id)
            # Second five coupons should not be present in codes
            _(secondHalf).each (c) -> expect(codes).to.not.contain(c._id)
            done()

      it "gets last 5 coupons out of 10 when a limit of 5 is set", (done) ->
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken + '&skip=5'
        request
          .get(baseURL + '/coupons' + queries)
          .end (res) ->
            expectCode res, 200
            codes = res.text
            sortedCoupons = _.sortBy(coupons, 'seq')
            firstHalf = sortedCoupons[0..4]
            secondHalf = sortedCoupons[5..9]

            # First five coupons should not be present in codes
            _(firstHalf).each (c) -> expect(codes).to.not.contain(c._id)
            # Second five coupons should be present in codes
            _(secondHalf).each (c) -> expect(codes).to.contain(c._id)
            done()

    context "while regular user", ->

      before (done) ->
        registerNewUser(done, true)

      it "does not get coupons", (done) ->

        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken
        request
          .get(baseURL + '/coupons' + queries)
          .end (res) ->
            expectCode res, 401
            expect(res.body.err).to.be.eql 'You don\'t have admin access'
            done()

  describe "POST /api/v2/user/coupon/:code", ->
    specialGear = (gear, has) ->
      items = ['body_special_wondercon_gold'
              'body_special_wondercon_black'
              'body_special_wondercon_red'
              'back_special_wondercon_gold'
              'back_special_wondercon_black'
              'back_special_wondercon_red'
              'eyewear_special_wondercon_black'
              'eyewear_special_wondercon_red']

      _(items).each (i) ->
        if(has)
          expect(gear[i]).to.be.ok
        else
          expect(gear[i]).to.not.be.ok

    beforeEach (done) ->
      registerNewUser ->
        gear = user.items.gear.owned
        specialGear(gear, false)
        done()
      , true

    context "unused coupon", ->
      it "applies coupon and awards equipment", (done) ->

        code = coupons[0]._id
        request
          .post(baseURL + '/user/coupon/' + code)
          .end (res) ->
            expectCode res, 200
            gear = res.body.items.gear.owned
            specialGear(gear, true)
            done()

    context "already used coupon", ->
      it "does not apply coupon and does not award equipment", (done) ->

        code = coupons[0]._id
        request
          .post(baseURL + '/user/coupon/' + code)
          .end (res) ->
            expectCode res, 400
            expect(res.body.err).to.be.eql "Coupon already used"
            User.findById user._id, (err, _user) ->
              gear = _user.items.gear.owned
              specialGear(gear, false)
              done()

    context "invalid coupon", ->
      it "does not apply coupon and does not award equipment", (done) ->

        code = "not-a-real-coupon"
        request
          .post(baseURL + '/user/coupon/' + code)
          .end (res) ->
            expectCode res, 400
            expect(res.body.err).to.be.eql "Invalid coupon code"
            User.findById user._id, (err, _user) ->
              gear = _user.items.gear.owned
              specialGear(gear, false)
              done()
