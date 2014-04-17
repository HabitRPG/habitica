var mongoose = require("mongoose");
var shared = require('habitrpg-shared');
var _ = require('lodash');
var async = require('async');
var cc = require('coupon-code');
var autoinc = require('mongoose-id-autoinc');

var CouponSchema = new mongoose.Schema({
  _id: {type: String, 'default': cc.generate},
  event: {type:String, enum:['wondercon']},
  user: {type: 'String', ref: 'User'}
});

CouponSchema.statics.generate = function(event, count, callback) {
  async.times(count, function(n,cb){
    mongoose.model('Coupon').create({event: event}, cb);
  }, callback);
}

CouponSchema.statics.apply = function(user, code, next){
  var _coupon,_user;
  async.waterfall([
    function(cb) {
      mongoose.model('Coupon').findById(cc.validate(code), cb);
    },
    function(coupon, cb) {
      _coupon = coupon;
      if (!coupon) return cb("Invalid coupon code");
      if (coupon.user) return cb("Coupon already used");
      switch (coupon.event) {
        case 'wondercon':
          user.items.gear.owned.headAccessory_special_wondercon_red     = true;
          user.items.gear.owned.headAccessory_special_wondercon_black   = true;
          user.items.gear.owned.back_special_wondercon_black            = true;
          user.items.gear.owned.back_special_wondercon_red              = true;
          user.items.gear.owned.body_special_wondercon_red     = true;
          user.items.gear.owned.body_special_wondercon_black   = true;
          user.items.gear.owned.body_special_wondercon_gold  = true;
          user.save(cb);
          break;
      }
    },
    function(user, count, cb){
      _user = user;
      _coupon.user = user._id;
      _coupon.save(cb);
    }
  ], function(err){
    if (err) return next(err);
    next(null,_user);
  })
}

CouponSchema.plugin(autoinc.plugin, {
  model: 'Coupon',
  field: 'seq'
});

module.exports.schema = CouponSchema;
module.exports.model = mongoose.model("Coupon", CouponSchema);

