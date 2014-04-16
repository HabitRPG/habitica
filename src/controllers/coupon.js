var _ = require('lodash');
var Coupon = require('./../models/coupon').model;
var api = module.exports;
var csv = require('express-csv');
var async = require('async');

api.ensureAdmin = function(req, res, next) {
  var user = res.locals.user;
  if (!user.contributor.sudo) return res.json(401, {err:"You don't have admin access"});
  next();
}

api.generateCoupons = function(req,res,next) {
  Coupon.generate(req.params.event, req.query.count, function(err){
    if(err) return next(err);
    res.send(200);
  });

//  var skip, count=req.params.count || 1;
//  async.waterfall([
//    function(cb) {
//      Coupon.findOne({}, {}, {sort: '-seq'}, cb);
//    },
//    function(_lastCoupon,cb){
//      skip = _lastCoupon ? _lastCoupon.seq : 0;
//      Coupon.generate(req.params.event, count, cb);
//    }
//  ], function(err){
//    if (err) return next(err);
//    //res.redirect('/api/v2/coupons?skip='+skip+'&limit='+count);
//    res.send(200);
//  })
}

api.getCoupons = function(req,res,next) {
  var options = {sort:'-seq'};
  if (req.query.limit) options.limit = req.query.limit;
  if (req.query.skip) options.limit = req.query.skip;
  Coupon.find({},{}, options, function(err,coupons){
    //res.header('Content-disposition', 'attachment; filename=coupons.csv');
    res.csv([['seq','event','code']].concat(_.map(coupons, function(c){
      return [c.seq, c.event, c._id];
    })));
  });
}

api.enterCode = function(req,res,next) {
  Coupon.apply(res.locals.user,req.params.code,function(err,user){
    if (err) return res.json(400,{err:err});
    res.json(user);
  });
}