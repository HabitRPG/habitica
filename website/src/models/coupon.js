var mongoose = require("mongoose");
var shared = require('../../../common');
var _ = require('lodash');
var async = require('async');
var cc = require('coupon-code');

var CouponSchema = new mongoose.Schema({
  _id: {type: String, 'default': cc.generate},
  event: {type:String, enum:['wondercon','google_6mo']},
  user: {type: 'String', ref: 'User'}
});

CouponSchema.statics.generate = function(event, count, callback) {
  async.times(count, function(n,cb){
    mongoose.model('Coupon').create({event: event}, cb);
  }, callback);
}

CouponSchema.statics.apply = function(user, code, next){
  async.auto({
    get_coupon: function (cb) {
      mongoose.model('Coupon').findById(cc.validate(code), cb);
    },
    apply_coupon: ['get_coupon', function (cb, results) {
      if (!results.get_coupon) return cb("Invalid coupon code");
      if (results.get_coupon.user) return cb("Coupon already used");
      switch (results.get_coupon.event) {
        case 'wondercon':
          user.items.gear.owned.eyewear_special_wondercon_red = true;
          user.items.gear.owned.eyewear_special_wondercon_black = true;
          user.items.gear.owned.back_special_wondercon_black = true;
          user.items.gear.owned.back_special_wondercon_red = true;
          user.items.gear.owned.body_special_wondercon_red = true;
          user.items.gear.owned.body_special_wondercon_black = true;
          user.items.gear.owned.body_special_wondercon_gold = true;
          user.extra = {signupEvent: 'wondercon'};
          user.save(cb);
          break;
      }
    }],
    expire_coupon: ['apply_coupon', function (cb, results) {
      results.get_coupon.user = user._id;
      results.get_coupon.save(cb);
    }]
  }, function(err, results){
    if (err) return next(err);
    next(null,results.apply_coupon[0]);
  })
}

module.exports.schema = CouponSchema;
module.exports.model = mongoose.model("Coupon", CouponSchema);

