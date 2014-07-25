var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var shared = require('habitrpg-shared');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var api = module.exports;

api.ensureAdmin = function(req, res, next) {
  var user = res.locals.user;
  if (!(user.contributor && user.contributor.admin)) return res.json(401, {err:"You don't have admin access"});
  next();
}

api.getHeroes = function(req,res,next) {
  User.find({'contributor.level':{$gt:0}})
    .select('contributor backer balance profile.name')
    .sort('-contributor.level')
    .exec(function(err, users){
      if (err) return next(err);
      res.json(users);
    });
}

api.getPatrons = function(req,res,next){
  var page = req.query.page || 0,
    perPage = 50;
  User.find({'backer.tier':{$gt:0}})
    .select('contributor backer profile.name')
    .sort('-backer.tier')
    .skip(page*perPage)
    .limit(perPage)
    .exec(function(err, users){
      if (err) return next(err);
      res.json(users);
    });
}

api.getHero = function(req,res,next) {
  User.findById(req.params.uid)
    .select('contributor balance profile.name purchased items')
    .select('auth.local.username auth.local.email auth.facebook auth.blocked')
    .exec(function(err, user){
      if (err) return next(err)
      if (!user) return res.json(400,{err:'User not found'});
      res.json(user);
  });
}

api.updateHero = function(req,res,next) {
  async.waterfall([
    function(cb){
      User.findById(req.params.uid, cb);
    },
    function(member, cb){
      if (!member) return res.json(404, {err: "User not found"});
      member.balance = req.body.balance || 0;
      if (req.body.contributor.level > (member.contributor && member.contributor.level || 0)) {
        member.flags.contributor = true;
        member.balance += (req.body.contributor.level - (member.contributor.level || 0))*.5 // +2 gems per tier
      }
      member.contributor = req.body.contributor;
      member.purchased.ads = req.body.purchased.ads;
      if (member.contributor.level >= 6) member.items.pets['Dragon-Hydra'] = 5;
      if (req.body.itemPath && req.body.itemVal
        && req.body.itemPath.indexOf('items.')===0
        && User.schema.paths[req.body.itemPath]) {
        shared.dotSet(member, req.body.itemPath, req.body.itemVal); // Sanitization at 5c30944 (deemed unnecessary)
      }
      if (_.isBoolean(req.body.auth.blocked)) member.auth.blocked = req.body.auth.blocked;
      member.save(cb);
    }
  ], function(err, saved){
    if (err) return next(err);
    res.json(204);
  })
}