var Coupon, app, makeSudoUser;

app = require("../../website/src/server");

Coupon = require("../../website/src/models/coupon").model;

makeSudoUser = function(usr, cb) {
  return registerNewUser(function() {
    var sudoUpdate;
    sudoUpdate = {
      "$set": {
        "contributor.sudo": true
      }
    };
    return User.findByIdAndUpdate(user._id, sudoUpdate, {
      "new": true
    }, function(err, _user) {
      usr = _user;
      return cb();
    });
  }, true);
};

describe("Coupons", function() {
  var coupons;
  before(function(done) {
    return async.parallel([
      function(cb) {
        return mongoose.connection.collections['coupons'].drop(function(err) {
          return cb();
        });
      }, function(cb) {
        return mongoose.connection.collections['users'].drop(function(err) {
          return cb();
        });
      }
    ], done);
  });
  coupons = null;
  describe("POST /api/v2/coupons/generate/:event", function() {
    context("while sudo user", function() {
      before(function(done) {
        makeSudoUser(user, done);
      });

      it("generates coupons", function(done) {
        var queries;
        queries = '?count=10';

        request.post(baseURL + '/coupons/generate/wondercon' + queries).end(function(err, res) {
          expectCode(res, 200);
          Coupon.find({
            event: 'wondercon'
          }, function(err, _coupons) {
            coupons = _coupons;
            expect(coupons.length).to.equal(10);
            _(coupons).each(function(c) {
              expect(c.event).to.equal('wondercon');
            }).value();
            done();
          });
        });
      });
    });

    return context("while regular user", function() {
      before(function(done) {
        return registerNewUser(done, true);
      });
      return it("does not generate coupons", function(done) {
        var queries;
        queries = '?count=10';
        return request.post(baseURL + '/coupons/generate/wondercon' + queries).end(function(err, res) {
          expectCode(res, 401);
          expect(res.body.err).to.equal('You don\'t have admin access');
          return done();
        });
      });
    });
  });
  describe("GET /api/v2/coupons", function() {
    context("while sudo user", function() {
      before(function(done) {
        return makeSudoUser(user, done);
      });
      it("gets coupons", function(done) {
        var queries;
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken;
        return request.get(baseURL + '/coupons' + queries).end(function(err, res) {
          var codes;
          expectCode(res, 200);
          codes = res.text;
          expect(codes).to.contain('code');
          _(coupons).each(function(c) {
            return expect(codes).to.contain(c._id);
          }).value();
          return done();
        });
      });
      it("gets first 5 coupons out of 10 when a limit of 5 is set", function(done) {
        var queries;
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken + '&limit=5';
        return request.get(baseURL + '/coupons' + queries).end(function(err, res) {
          var codes, firstHalf, secondHalf, sortedCoupons;
          expectCode(res, 200);
          codes = res.text;
          sortedCoupons = _.sortBy(coupons, 'seq');
          firstHalf = sortedCoupons.slice(0, 5);
          secondHalf = sortedCoupons.slice(5, 10);
          _(firstHalf).each(function(c) {
            return expect(codes).to.contain(c._id);
          }).value();
          _(secondHalf).each(function(c) {
            return expect(codes).to.not.contain(c._id);
          }).value();
          return done();
        });
      });
      return it("gets last 5 coupons out of 10 when a limit of 5 is set", function(done) {
        var queries;
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken + '&skip=5';
        return request.get(baseURL + '/coupons' + queries).end(function(err, res) {
          var codes, firstHalf, secondHalf, sortedCoupons;
          expectCode(res, 200);
          codes = res.text;
          sortedCoupons = _.sortBy(coupons, 'seq');
          firstHalf = sortedCoupons.slice(0, 5);
          secondHalf = sortedCoupons.slice(5, 10);
          _(firstHalf).each(function(c) {
            return expect(codes).to.not.contain(c._id);
          }).value();
          _(secondHalf).each(function(c) {
            return expect(codes).to.contain(c._id);
          }).value();
          return done();
        });
      });
    });
    return context("while regular user", function() {
      before(function(done) {
        return registerNewUser(done, true);
      });
      return it("does not get coupons", function(done) {
        var queries;
        queries = '?_id=' + user._id + '&apiToken=' + user.apiToken;
        return request.get(baseURL + '/coupons' + queries).end(function(err, res) {
          expectCode(res, 401);
          expect(res.body.err).to.equal('You don\'t have admin access');
          return done();
        });
      });
    });
  });
  return describe("POST /api/v2/user/coupon/:code", function() {
    var specialGear;
    specialGear = function(gear, has) {
      var items;
      items = ['body_special_wondercon_gold', 'body_special_wondercon_black', 'body_special_wondercon_red', 'back_special_wondercon_red', 'back_special_wondercon_black', 'back_special_wondercon_red', 'eyewear_special_wondercon_black', 'eyewear_special_wondercon_red'];
      return _(items).each(function(i) {
        if (has) {
          return expect(gear[i]).to.exist;
        } else {
          return expect(gear[i]).to.not.exist;
        }
      }).value();
    };
    beforeEach(function(done) {
      return registerNewUser(function() {
        var gear;
        gear = user.items.gear.owned;
        specialGear(gear, false);
        return done();
      }, true);
    });
    context("unused coupon", function() {
      return it("applies coupon and awards equipment", function(done) {
        var code;
        code = coupons[0]._id;
        return request.post(baseURL + '/user/coupon/' + code).end(function(err, res) {
          var gear;
          expectCode(res, 200);
          gear = res.body.items.gear.owned;
          specialGear(gear, true);
          return done();
        });
      });
    });
    context("already used coupon", function() {
      return it("does not apply coupon and does not award equipment", function(done) {
        var code;
        code = coupons[0]._id;
        return request.post(baseURL + '/user/coupon/' + code).end(function(err, res) {
          expectCode(res, 400);
          expect(res.body.err).to.equal("Coupon already used");
          return User.findById(user._id, function(err, _user) {
            var gear;
            gear = _user.items.gear.owned;
            specialGear(gear, false);
            return done();
          });
        });
      });
    });
    return context("invalid coupon", function() {
      return it("does not apply coupon and does not award equipment", function(done) {
        var code;
        code = "not-a-real-coupon";
        return request.post(baseURL + '/user/coupon/' + code).end(function(err, res) {
          expectCode(res, 400);
          expect(res.body.err).to.equal("Invalid coupon code");
          return User.findById(user._id, function(err, _user) {
            var gear;
            gear = _user.items.gear.owned;
            specialGear(gear, false);
            return done();
          });
        });
      });
    });
  });
});
