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

api.getMember = function(req, res) {
  User.findById(req.params.uid)
    .select('contributor balance profile.name')
    .exec(function(err, user){
      if (err) return res.json(500,{err:err});
      if (!user) return res.json(400,{err:'User not found'});
      res.json(user);
  });
}

api.listMembers = function(req, res) {
  User.find({'contributor.level':{$exists:true}})
    .select('contributor balance profile.name')
    .sort('contributor.text')
    .exec(function(err, users){
      if (err) return res.json(500,{err:err});
      res.json(users);
    });
}

api.updateMember = function(req, res) {
  async.waterfall([
    function(cb){
      User.findById(req.params.uid, cb);
    },
    function(member, cb){
      if (!member) return res.json(404, {err: "User not found"});
      if (req.body.contributor.level > (member.contributor && member.contributor.level || 0)) {
        member.flags.contributor = true;
        member.balance += (req.body.contributor.level - (member.contributor.level || 0))*.5 // +2 gems per tier
      }
      _.merge(member, _.pick(req.body, 'contributor'));
      if (member.contributor.level >= 6) member.items.pets['Dragon-Hydra'] = 5;
      member.save(cb);
    }
  ], function(err, saved){
    if (err) return res.json(500,{err:err});
    res.json(204);
  })
}