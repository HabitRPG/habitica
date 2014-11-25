var User = require('mongoose').model('User');
var groups = require('../models/group');
var partyFields = require('./groups').partyFields
var api = module.exports;
var async = require('async');
var _ = require('lodash');
var shared = require('habitrpg-shared');

var fetchMember = function(uuid, restrict){
  return function(cb){
    var q = User.findById(uuid);
    if (restrict) q.select(partyFields);
    q.exec(function(err, member){
      if (err) return cb(err);
      if (!member) return cb({code:404, err: 'User not found'});
      return cb(null, member);
    })
  }
}

var sendErr = function(err, res, next){
  err.code ? res.json(err.code, {err: err.err}) : next(err);
}

api.getMember = function(req, res, next) {
  fetchMember(req.params.uuid, true)(function(err, member){
    if (err) return sendErr(err, res, next);
    res.json(member);
  })
}

api.sendPrivateMessage = function(req,res,next){
  async.waterfall([
    fetchMember(req.params.uuid),
    function(member, cb){
      if (~member.inbox.blocks.indexOf(res.locals.user._id) // can't send message if that user blocked me
        || ~res.locals.user.inbox.blocks.indexOf(member._id) // or if I blocked them
        || member.inbox.optOut) { // or if they've opted out of messaging
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
    if (err) return sendErr(err, res, next);
    res.send(200);
  })
}