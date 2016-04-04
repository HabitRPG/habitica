import {
  model as groups,
  chatDefaults,
} from '../../models/group';
import {
  model as User,
} from '../../models/user';
let partyFields = require('./groups').partyFields;
var api = module.exports;
var async = require('async');
var _ = require('lodash');
var shared = require('../../../../common');
var utils = require('../../libs/api-v2/utils');
var nconf = require('nconf');
var pushNotify = require('./pushNotifications');

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
  err.code ? res.status(err.code).json({err: err.err}) : next(err);
}

api.getMember = function(req, res, next) {
  fetchMember(req.params.uuid, true)(function(err, member){
    if (err) return sendErr(err, res, next);
    res.json(member);
  })
}

api.sendMessage = function(user, member, data){
  var msg;
  if (!data.type) {
    msg = data.message
  } else {
    msg = "`Hello " + member.profile.name + ", " + user.profile.name + " has sent you ";
    if (data.type == 'gems') {
      var gemAmount = data.gems.amount;
      var gemLabel = gemAmount > 1 ? "gems" : "gem";
      msg += gemAmount + " " + gemLabel + "!`";
    } else {
      var monthAmount = shared.content.subscriptionBlocks[data.subscription.key].months;
      var monthLabel = monthAmount > 1 ? "months" : "month";
      msg += monthAmount + " " + monthLabel + " of subscription!`";
    }
    msg += data.message ? data.message : '';
  }
  shared.refPush(member.inbox.messages, chatDefaults(msg, user));
  member.inbox.newMessages++;
  member._v++;
  member.markModified('inbox.messages');

  shared.refPush(user.inbox.messages, _.defaults({sent:true}, chatDefaults(msg, member)));
  user.markModified('inbox.messages');
}

api.sendPrivateMessage = function(req, res, next){
  var fetchedMember;
  async.waterfall([
    fetchMember(req.params.uuid),
    function(member, cb) {
      fetchedMember = member;
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

    if(fetchedMember.preferences.emailNotifications.newPM !== false){
      utils.txnEmail(fetchedMember, 'new-pm', [
        {name: 'SENDER', content: utils.getUserInfo(res.locals.user, ['name']).name},
        {name: 'PMS_INBOX_URL', content: '/#/options/groups/inbox'}
      ]);
    }

    res.sendStatus(200);
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
          if (member.id == user.id)
            return cb({code: 401, err: "Cannot send gems to yourself. Try a subscription instead."});
          if (!amt || amt <=0 || user.balance < amt)
            return cb({code: 401, err: "Amount must be within 0 and your current number of gems."});
          member.balance += amt;
          user.balance -= amt;
          api.sendMessage(user, member, req.body);

          var byUsername = utils.getUserInfo(user, ['name']).name;

          if(member.preferences.emailNotifications.giftedGems !== false){
            utils.txnEmail(member, 'gifted-gems', [
              {name: 'GIFTER', content: byUsername},
              {name: 'X_GEMS_GIFTED', content: req.body.gems.amount}
            ]);
          }

          pushNotify.sendNotify(member, shared.i18n.t('giftedGems'), shared.i18n.t('giftedGemsInfo', { amount: req.body.gems.amount, name: byUsername }));

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
    res.sendStatus(200);
  });
}
