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
}

api.getCoupons = function(req,res,next) {
  var options = {sort:'seq'};
  if (req.query.limit) options.limit = req.query.limit;
  if (req.query.skip) options.limit = req.query.skip;
  Coupon.find({},{}, options, function(err,coupons){
    //res.header('Content-disposition', 'attachment; filename=coupons.csv');
    res.csv([['code']].concat(_.map(coupons, function(c){
      return ["Hi, it's nice to meet you! Want some exclusive UnConventional Armor? You can redeem the coupon code at the end of this message at http://habitrpg.com/#/options/settings/coupon (If you haven't already created an account, you'll need to do that first.) See you in the game! COUPON CODE: "+ c._id];
    })));
  });
}

api.enterCode = function(req,res,next) {
  Coupon.apply(res.locals.user,req.params.code,function(err,user){
    if (err) return res.json(400,{err:err});
    res.json(user);
  });
}