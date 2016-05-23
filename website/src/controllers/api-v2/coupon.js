var _ = require('lodash');
var Coupon = require('./../../models/coupon').model;
var api = module.exports;
var csvStringify = require('csv-stringify');
var async = require('async');

api.ensureAdmin = function(req, res, next) {
  if (!res.locals.user.contributor.sudo) return res.status(401).json({err:"You don't have admin access"});
  next();
}

api.generateCoupons = function(req,res,next) {
  let count = Number(req.query.count);
  Coupon.generate(req.params.event, count, function(err){
    if(err) return next(err);
    res.sendStatus(200);
  });
}

api.getCoupons = function(req,res,next) {
  var options = {sort:'seq'};
  if (req.query.limit) options.limit = req.query.limit;
  if (req.query.skip) options.skip = req.query.skip;
  Coupon.find({},{}, options, function(err,coupons){
    let output = [['code']].concat(_.map(coupons, function(c){
      return [c._id];
    }))

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=habitica-coupons.csv`,
    });
    csvStringify(output, (err, csv) => {
      if (err) return next(err);
      res.status(200).send(csv);
    });
  });
}

api.enterCode = function(req,res,next) {
  Coupon.apply(res.locals.user,req.params.code,function(err,user){
    if (err) return res.status(400).json({err:err});
    res.json(user);
  });
}
