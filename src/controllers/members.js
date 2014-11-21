var User = require('mongoose').model('User');
var groups = require('../models/group');
var partyFields = require('./groups').partyFields
var api = module.exports;
var async = require('async');
var _ = require('lodash');
var shared = require('habitrpg-shared');

api.getMember = function(req, res, next) {
  User.findById(req.params.uuid).select(partyFields).exec(function(err, user){
    if (err) return next(err);
    if (!user) return res.json(400,{err:'User not found'});
    res.json(user);
  })
}

api.sendPrivateMessage = function(req,res,next){
  async.waterfall([
    function(cb){
      User.findById(req.params.uuid, cb);
    },
    function(member, cb){
      if (!member) return cb({code:404, err: 'User not found'});
      if (~member.inbox.blocks.indexOf(res.locals.user._id) || member.inbox.optOut) {
        return cb({code:401, err: "Can't send message to this user."});
      }

      var message = groups.chatDefaults(req.body.message, res.locals.user);
      shared.refPush(member.inbox.messages, message);
      member.inbox.newMessages++;
      member._v++;
      member.markModified('inbox.messages');

      var message = groups.chatDefaults(req.body.message, member);
      shared.refPush(res.locals.user.inbox.messages, _.defaults({sent:true},message));
      res.locals.user.markModified('inbox.messages');

      member.save(cb);
    },
    function(a,b,cb){
      res.locals.user.save(cb);
    }
  ], function(err){
    if (err) return err.code ? res.json(err.code,{err:err.err}) : err;
    res.send(200);
  })

}

api.block = function(req,res,next){
  var b = res.locals.user.inbox;
  if (~b.blocks.indexOf(req.params.id)){
    b.blocks.push(req.params.id)
    res.locals.user.save();
  }
  res.send(200);
}
