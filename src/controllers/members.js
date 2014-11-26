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

api.sendMessage = function(user, member, data){
  var msg = data.amount
    ? "`Hello " + member.profile.name + ", " + user.profile.name + " has sent you " + data.amount + " gems!` " + data.message
    : data.message;
  shared.refPush(member.inbox.messages, groups.chatDefaults(msg, user));
  member.inbox.newMessages++;
  member._v++;
  member.markModified('inbox.messages');

  shared.refPush(user.inbox.messages, _.defaults({sent:true}, groups.chatDefaults(msg, member)));
  user.markModified('inbox.messages');
}

api.sendPrivateMessage = function(req, res, next){
  async.waterfall([
    fetchMember(req.params.uuid),
    function(member, cb) {
      if (~member.inbox.blocks.indexOf(res.locals.user._id) // can't send message if that user blocked me
        || ~res.locals.user.inbox.blocks.indexOf(member._id) // or if I blocked them
        || member.inbox.optOut) { // or if they've opted out of messaging
        return cb({code: 401, err: "Can't send message to this user."});
      }
      api.sendMessage(res.locals.user, member, {message:req.body.message});
      async.parallel([
        function (cb2) {  member.save(cb2) },
        function (cb2) { res.locals.user.save(cb2) }
      ], cb);
    }
  ], function(err){
    if (err) return sendErr(err, res, next);
    res.send(200);
  })
}

api.sendGift = function(req, res, next){
  async.waterfall([
    fetchMember(req.params.uuid),
    function(member, cb) {
      // Gems
      switch (req.body.type) {
        case "gems":
          var amt = req.body.gems.amount / 4,
            user = res.locals.user;
          if (amt < 1 || user.balance < amt)
            return cb({code: 401, err: "Amount must be within 0 and your current number of gems."});
          member.balance += amt;
          user.balance -= amt;
          api.sendMessage(user, member, {amount:req.body.gems.amount, message:req.body.message});
          return async.parallel([
            function (cb2) { member.save(cb2) },
            function (cb2) { user.save(cb2) }
          ], cb);
        case "subscription":
          return cb();
        default:
          return cb({code:400, err:"Body must contain a gems:{amount,fromBalance} or subscription:{months} object"});
      }
    }
  ], function(err) {
    if (err) return sendErr(err, res, next);
    res.send(200);
  });
}