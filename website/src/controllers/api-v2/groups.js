'use strict';
// @see ../routes for routing

function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var Q = require('q');
var utils = require('./../../libs/api-v2/utils');
var shared = require('../../../../common');

import { removeFromArray } from '../../libs/api-v3/collectionManipulators';

import {
  model as User,
} from './../../models/user';
import {
  model as Group,
  TAVERN_ID,
} from './../../models/group';
import {
  model as Challenge,
} from './../../models/challenge';
import {
  model as EmailUnsubscription,
} from './../../models/emailUnsubscription';

var isProd = nconf.get('NODE_ENV') === 'production';
var api = module.exports;
var pushNotify = require('./pushNotifications');
var analytics = utils.analytics;
var firebase = require('../../libs/api-v2/firebase');

/*
  ------------------------------------------------------------------------
  Groups
  ------------------------------------------------------------------------
*/

var partyFields = api.partyFields = 'profile preferences stats achievements party backer contributor auth.timestamps items';
var nameFields = 'profile.name';
var challengeFields = '_id name';
var guildPopulate = {path: 'members', select: nameFields, options: {limit: 15} };
const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map(email => {return {email, canSend: true}});

/**
 * For parties, we want a lot of member details so we can show their avatars in the header. For guilds, we want very
 * limited fields - and only a sampling of the members, beacuse they can be in the thousands
 * @param type: 'party' or otherwise
 * @param q: the Mongoose query we're building up
 * @param additionalFields: if we want to populate some additional field not fetched normally
 *        pass it as a string, parties only
 */
var populateQuery = function(type, q, additionalFields){
  if (type == 'party')
    q.populate('members', partyFields + (additionalFields ? (' ' + additionalFields) : ''));
  else
    q.populate(guildPopulate);
  q.populate('leader', nameFields);
  q.populate('invites', nameFields);
  q.populate({
    path: 'challenges',
    match: (type=='habitrpg') ? {_id:{$ne:'95533e05-1ff9-4e46-970b-d77219f199e9'}} : undefined, // remove the Spread the Word Challenge for now, will revisit when we fix the closing-challenge bug
    select: challengeFields,
    options: {sort: {official: -1, timestamp: -1}}
  });
  return q;
}

/**
 * Fetch groups list. This no longer returns party or tavern, as those can be requested indivdually
 * as /groups/party or /groups/tavern
 */
api.list = function(req, res, next) {
  var user = res.locals.user;
  var groupFields = 'name description memberCount balance leader';
  var sort = '-memberCount';
  var type = req.query.type || 'party,guilds,public,tavern';

  async.parallel({

    // unecessary given our ui-router setup
    party: function(cb){
      if (!~type.indexOf('party')) return cb(null, {});
      Group.findOne({_id: user.party._id, type: 'party'})
        .select(groupFields).exec(function(err, party){
          if (err) return cb(err);
          if (!party) return cb(null, []);
          party.getTransformedData({cb: function (err, transformedParty) {
            if (err) return cb(err);
            cb(null, (transformedParty === null ? [] : [transformedParty])); // return as an array for consistent ngResource use
          }});
        });
    },

    guilds: function(cb) {
      if (!~type.indexOf('guilds')) return cb(null, []);
      Group.find({_id: {'$in': user.guilds}, type:'guild'})
        .select(groupFields).sort(sort).exec(function (err, guilds) {
          if (err) return cb(err);
          async.map(guilds, function (guild, cb1) {
            guild.getTransformedData({cb: cb1})
          }, function(err, guildsTransormed) {
            cb(err, guildsTransormed);
          });
        });
    },

    'public': function(cb) {
      if (!~type.indexOf('public')) return cb(null, []);
      Group.find({privacy: 'public'})
        .select(groupFields)
        .sort(sort)
        .lean()
        .exec(function(err, groups){
          if (err) return cb(err);
          _.each(groups, function(g){
            // To save some client-side performance, don't send down the full members arr, just send down temp var _isMember
            if (user.guilds.indexOf(g._id) !== -1) g._isMember = true;
          });
          cb(null, groups);
        });
    },

    // unecessary given our ui-router setup
    tavern: function(cb) {
      if (!~type.indexOf('tavern')) return cb(null, {});
      Group.findById(TAVERN_ID).select(groupFields).exec(function(err, tavern){
        if (err) return cb(err);
        tavern.getTransformedData({cb: function (err, transformedTavern) {
          if (err) return cb(err);
          cb(null, ([transformedTavern])); // return as an array for consistent ngResource use
        }});
      });
    }

  }, function(err, results){
    if (err) return next(err);
    // ngResource expects everything as arrays. We used to send it down as a structured object: {public:[], party:{}, guilds:[], tavern:{}}
    // but unfortunately ngResource top-level attrs are considered the ngModels in the list, so we had to do weird stuff and multiple
    // requests to get it to work properly. Instead, we're not depending on the client to do filtering / organization, and we're
    // just sending down a merged array. Revisit
    var arr = _.reduce(results, function(m,v){
      if (_.isEmpty(v)) return m;
      return m.concat(_.isArray(v) ? v : [v]);
    }, [])
    res.json(arr);

    user = groupFields = sort = type = null;
  })
};

/**
 * Get group
 * TODO: implement requesting fields ?fields=chat,members
 */
api.get = function(req, res, next) {
  var user = res.locals.user;
  var gid = req.params.gid;
  let isUserGuild = user.guilds.indexOf(gid) !== -1;

  var q;

  if (gid === 'party' || gid === user.party._id) {
    q = Group.findOne({_id: user.party._id, type: 'party'})
  } else {

    if (isUserGuild) {
      q = Group.findOne({type: 'guild', _id: gid});
    } else if (gid === 'habitrpg') {
      q = Group.findOne({_id: TAVERN_ID});
    } else {
      q = Group.findOne({type: 'guild', privacy: 'public', _id: gid});
    }
  }

  q.populate('leader', nameFields);

  //populateQuery(gid, q);
  q.exec(function(err, group){
    if (err) return next(err);
    if(!group){
      if(gid !== 'party') return res.status(404).json({err: shared.i18n.t('messageGroupNotFound')});

      // Don't send a 404 when querying for a party even if it doesn't exist
      // so that users with no party don't get a 404 on every access to the site
      return res.json(group);
    }

    group.getTransformedData({
      cb: function (err, transformedGroup) {
        if (err) return next(err);

        if (!user.contributor.admin) {
          _purgeFlagInfoFromChat(transformedGroup, user);
        }

        //Since we have a limit on how many members are populate to the group, we want to make sure the user is always in the group
        var userInGroup = _.find(transformedGroup.members, function(member){ return member._id == user._id; });
        if ((gid === 'party' || isUserGuild) && !userInGroup) {
          transformedGroup.members.splice(0,1);
          transformedGroup.members.push(user);
        }

        res.json(transformedGroup);
      },
      populateMembers: group.type === 'party' ? partyFields : nameFields,
      populateInvites: nameFields,
      populateChallenges: challengeFields,
    });
  });
};


api.create = function(req, res, next) {
  var group = new Group(req.body);
  var user = res.locals.user;
  //group.members = [user._id];
  group.leader = user._id;
  if (!group.name) group.name = 'group name';

  if(group.type === 'guild'){
    user.guilds.push(group._id);
    if(user.balance < 1) return res.status(401).json({err: shared.i18n.t('messageInsufficientGems')});

    group.balance = 1;
    user.balance--;

    async.waterfall([
      function(cb){user.save(cb)},
      function(saved,ct,cb){group.save(cb)},
      function(saved,ct,cb){
        firebase.updateGroupData(saved);
        firebase.addUserToGroup(saved._id, user._id);
        saved.getTransformedData({
          populateMembers: nameFields,
          cb,
        })
      }
    ],function(err,groupTransformed){
      if (err) return next(err);
      res.json(groupTransformed);
      group = user = null;
    });

  } else{
    if (user.party._id) return res.status(400).json({err:shared.i18n.t('messageGroupAlreadyInParty')});
    user.party._id = group._id;
    user.save(function (err) {
      if (err) return next(err);
      group.save(function(err, saved) {
        if (err) return next(err);
        saved.getTransformedData({
          populateMembers: nameFields,
          cb (err, groupTransformed) {
            res.json(groupTransformed);
          },
        });
      });
    })
  }
}

api.update = function(req, res, next) {
  var group = res.locals.group;
  var user = res.locals.user;

  if(group.leader !== user._id)
    return res.status(401).json({err: shared.i18n.t('messageGroupOnlyLeaderCanUpdate')});

  'name description logo logo leaderMessage leader leaderOnly'.split(' ').forEach(function(attr){
    if (req.body[attr]) group[attr] = req.body[attr];
  });

  group.save(function(err, saved){
    if (err) return next(err);

    firebase.updateGroupData(saved);
    res.sendStatus(204);
  });
}

// TODO remove from api object?
api.attachGroup = function(req, res, next) {
  var user = res.locals.user;
  var gid = req.params.gid === 'party' ? user.party._id : req.params.gid;
  if (gid === 'habitrpg') gid = TAVERN_ID;

  let q = Group.findOne({_id: gid})

  q.exec(function(err, group){
    if(err) return next(err);
    if(!group) return res.status(404).json({err: shared.i18n.t('messageGroupNotFound')});

    if (!user.contributor.admin) {
      _purgeFlagInfoFromChat(group, user);
    }

    res.locals.group = group;
    next();
  });
}

api.getChat = function(req, res, next) {
  // TODO: This code is duplicated from api.get - pull it out into a function to remove duplication.
  var user = res.locals.user;
  var gid = req.params.gid;

  var q;
  let isUserGuild = user.guilds.indexOf(gid) !== -1;

  if (gid === 'party' || gid === user.party._id) {
    q = Group.findOne({_id: user.party._id, type: 'party'})
  } else {
    if (isUserGuild) {
      q = Group.findOne({type: 'guild', _id: gid});
    } else if (gid === 'habitrpg') {
      q = Group.findOne({_id: TAVERN_ID});
    } else {
      q = Group.findOne({type: 'guild', privacy: 'public', _id: gid});
    }
  }

  q.exec(function(err, group){
    if (err) return next(err);
    if (!group && gid!=='party') return res.status(404).json({err: shared.i18n.t('messageGroupNotFound')});

    res.json(res.locals.group.chat);
    gid = null;
  });
};

/**
 * TODO make this it's own ngResource so we don't have to send down group data with each chat post
 */
api.postChat = function(req, res, next) {
  if(!req.query.message) {
    return res.status(400).json({err: shared.i18n.t('messageGroupChatBlankMessage')});
  } else {
    var user = res.locals.user
    var group = res.locals.group;
    if (group.type!='party' && user.flags.chatRevoked) return res.status(401).json({err:'Your chat privileges have been revoked.'});
    var lastClientMsg = req.query.previousMsg;
    var chatUpdated = (lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg) ? true : false;

    group.sendChat(req.query.message, user); // TODO this should be body, but ngResource is funky

    if (group.type === 'party') {
      user.party.lastMessageSeen = group.chat[0].id;
      user.save();
    }

    group.save(function(err, saved){
      if (err) return next(err);
      chatUpdated ? res.json({chat: group.chat}) : res.json({message: saved.chat[0]});
      group = chatUpdated = null;
    });
  }
}

api.deleteChatMessage = function(req, res, next){
  var user = res.locals.user
  var group = res.locals.group;
  var message = _.find(group.chat, {id: req.params.messageId});

  if(!message) return res.status(404).json({err: "Message not found!"});

  if(user._id !== message.uuid && !(user.backer && user.contributor.admin))
    return res.status(401).json({err: "Not authorized to delete this message!"})

  var lastClientMsg = req.query.previousMsg;
  var chatUpdated = (lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg) ? true : false;

  Group.update({_id:group._id}, {$pull:{chat:{id: req.params.messageId}}}, function(err){
    if(err) return next(err);
    chatUpdated ? res.json({chat: group.chat}) : res.sendStatus(204);
    group = chatUpdated = null;
  });
}

api.flagChatMessage = function(req, res, next){
  var user = res.locals.user
  var group = res.locals.group;
  var message = _.find(group.chat, {id: req.params.mid});

  if(!message) return res.status(404).json({err: shared.i18n.t('messageGroupChatNotFound')});
  if(message.uuid == user._id) return res.status(401).json({err: shared.i18n.t('messageGroupChatFlagOwnMessage')});

  User.findOne({_id: message.uuid}, {auth: 1}, function(err, author){
    if(err) return next(err);

    // Log user ids that have flagged the message
    if(!message.flags) message.flags = {};
    if(message.flags[user._id] && !user.contributor.admin) return res.status(401).json({err: shared.i18n.t('messageGroupChatFlagAlreadyReported')});
    message.flags[user._id] = true;

    // Log total number of flags (publicly viewable)
    if(!message.flagCount) message.flagCount = 0;
    if(user.contributor.admin){
      // Arbitraty amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++
    }

    Group.update({_id: group._id, 'chat.id': message.id}, {'$set': {
      'chat.$.flags': message.flags,
      'chat.$.flagCount': message.flagCount,
    }}, function(err) {
      if (err) return next(err);

      utils.txnEmail(FLAG_REPORT_EMAILS, 'flag-report-to-mods', [
        {name: "MESSAGE_TIME", content: (new Date(message.timestamp)).toString()},
        {name: "MESSAGE_TEXT", content: message.text},

        {name: "REPORTER_USERNAME", content: user.profile.name},
        {name: "REPORTER_UUID", content: user._id},
        {name: "REPORTER_EMAIL", content: user.auth.local ? user.auth.local.email : ((user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0]) ? user.auth.facebook.emails[0].value : null)},
        {name: "REPORTER_MODAL_URL", content: "/static/front/#?memberId=" + user._id},

        {name: "AUTHOR_USERNAME", content: message.user},
        {name: "AUTHOR_UUID", content: message.uuid},
        {name: "AUTHOR_EMAIL", content: author.auth.local ? author.auth.local.email : ((author.auth.facebook && author.auth.facebook.emails && author.auth.facebook.emails[0]) ? author.auth.facebook.emails[0].value : null)},
        {name: "AUTHOR_MODAL_URL", content: "/static/front/#?memberId=" + message.uuid},

        {name: "GROUP_NAME", content: group.name},
        {name: "GROUP_TYPE", content: group.type},
        {name: "GROUP_ID", content: group._id},
        {name: "GROUP_URL", content: group._id == TAVERN_ID ? '/#/options/groups/tavern' : (group.type === 'guild' ? ('/#/options/groups/guilds/' + group._id) : 'party')},
      ]);

      return res.sendStatus(204);
    });
  });
}

api.clearFlagCount = function(req, res, next){
  var user = res.locals.user
  var group = res.locals.group;
  var message = _.find(group.chat, {id: req.params.mid});

  if(!message) return res.status(404).json({err: shared.i18n.t('messageGroupChatNotFound')});

  if(user.contributor.admin){
    message.flagCount = 0;

    Group.update({_id: group._id, 'chat.id': message.id}, {'$set': {
      'chat.$.flagCount': message.flagCount,
    }}, function(err) {
      if(err) return next(err);
      return res.sendStatus(204);
    });
  } else {
    return res.status(401).json({err: shared.i18n.t('messageGroupChatAdminClearFlagCount')})
  }
}

api.seenMessage = function(req,res,next){
  // Skip the auth step, we want this to be fast. If !found with uuid/token, then it just doesn't save
  // Check for req.params.gid to exist
  if(req.params.gid){
    var update = {$unset:{}};
    update['$unset']['newMessages.'+req.params.gid] = '';
    User.update({_id:req.headers['x-api-user'], apiToken:req.headers['x-api-key']},update).exec();
  }
  res.sendStatus(200);
}

api.likeChatMessage = function(req, res, next) {
  var user = res.locals.user;
  var group = res.locals.group;
  var message = _.find(group.chat, {id: req.params.mid});

  if (!message) return res.status(404).json({err: shared.i18n.t('messageGroupChatNotFound')});
  if (message.uuid == user._id) return res.status(401).json({err: shared.i18n.t('messageGroupChatLikeOwnMessage')});
  if (!message.likes) message.likes = {};
  if (message.likes[user._id]) {
    delete message.likes[user._id];
  } else {
    message.likes[user._id] = true;
  }

  Group.update({_id: group._id, 'chat.id': message.id}, {'$set': {
    'chat.$.likes': message.likes
  }}, function(err) {
    if (err) return next(err);
    return res.send(group.chat);
  });
}

api.join = function(req, res, next) {
  var user = res.locals.user,
    group = res.locals.group,
    isUserInvited = false;

  if (group.type == 'party' && group._id == (user.invitations && user.invitations.party && user.invitations.party.id)) {
    User.update({_id:user.invitations.party.inviter}, {$inc:{'items.quests.basilist':1}}).exec(); // Reward inviter
    user.invitations.party = {}; // Clear invite
    user.markModified('invitations.party');
    user.party._id = group._id;
    user.save();
    // invite new user to pending quest
    if (group.quest.key && !group.quest.active) {
      User.update({_id:user._id},{$set: {'party.quest.RSVPNeeded': true, 'party.quest.key': group.quest.key}}).exec();
      group.quest.members[user._id] = undefined;
      group.markModified('quest.members');
    }
    isUserInvited = true;
  } else if (group.type == 'guild') {
    var i = _.findIndex(user.invitations.guilds, {id:group._id});
    if (~i){
      isUserInvited = true;
      user.invitations.guilds.splice(i,1);
      user.guilds.push(group._id);
      user.save();
    }else{
      isUserInvited = group.privacy === 'private' ? false : true;
      if (isUserInvited) {
        user.guilds.push(group._id);
        user.save();
      }
    }
  }

  if(!isUserInvited) return res.status(401).json({err: shared.i18n.t('messageGroupRequiresInvite')});

  if (group.memberCount === 0) {
    group.leader = user._id;
  }

  /*if (!_.contains(group.members, user._id)){
    if (group.members.length === 0) {
      group.leader = user._id;
    }

    group.members.push(user._id);

    if (group.invites.length > 0) {
     group.invites.splice(_.indexOf(group.invites, user._id), 1);
    }
  }*/

  async.series([
    function(cb){
      group.save(cb);
    },
    function(cb){
      firebase.addUserToGroup(group._id, user._id);
      group.getTransformedData({
        cb,
        populateMembers: group.type === 'party' ? partyFields : nameFields,
        populateInvites: nameFields,
        populateChallenges: challengeFields,
      })
    }
  ], function(err, results){
    if (err) return next(err);
    // Return the group? Or not?
    res.json(results[1]);
    group = null;
  });
}

api.leave = function(req, res, next) {
  var user = res.locals.user;
  var group = res.locals.group;

  if (group.type === 'party') {
    if (group.quest && group.quest.leader === user._id) {
      return res.json(403, 'You cannot leave your party when you have started a quest. Abort the quest first.');
    }

    if (group.quest && group.quest.active && group.quest.members && group.quest.members[user._id]) {
      return res.json(403, 'You cannot leave party during an active quest. Please leave the quest first.');
    }
  }

  // When removing the user from challenges, should we keep the tasks?
  var keep = (/^remove-all/i).test(req.query.keep) ? 'remove-all' : 'keep-all';

  group.leave(user, keep)
    .then(() => res.sendStatus(204))
    .catch(next);
};

var inviteByUUIDs = function(uuids, group, req, res, next){
  async.each(uuids, function(uuid, cb){
    User.findById(uuid, function(err,invite){
      if (err) return cb(err);
      if (!invite)
         return cb({code:400,err:'User with id "' + uuid + '" not found'});
      if (group.type == 'guild') {
        if (_.contains(invite.guilds, group._id))
          return cb({code:400, err: "User already in that group"});
        if (invite.invitations && invite.invitations.guilds && _.find(invite.invitations.guilds, {id:group._id}))
          return cb({code:400, err:"User already invited to that group"});
        sendInvite();
      } else if (group.type == 'party') {
        if (invite.invitations && !_.isEmpty(invite.invitations.party))
          return cb({code: 400,err:"User already pending invitation."});
        if (invite.party && invite.party._id) {
          return cb({code: 400, err: "User already in a party."})
        }
        sendInvite();
      }

      function sendInvite (){
        if(group.type === 'guild'){
          invite.invitations.guilds.push({id: group._id, name: group.name, inviter:res.locals.user._id});

          pushNotify.sendNotify(invite, shared.i18n.t('invitedGuild'), group.name);
        }else{
          //req.body.type in 'guild', 'party'
          invite.invitations.party = {id: group._id, name: group.name, inviter:res.locals.user._id};

          pushNotify.sendNotify(invite, shared.i18n.t('invitedParty'), group.name);
        }

        //group.invites.push(invite._id);

        async.series([
          function(cb){
            invite.save(cb);
          }
        ], function(err, results){
          if (err) return cb(err);

          if(invite.preferences.emailNotifications['invited' + (group.type == 'guild' ? 'Guild' : 'Party')] !== false){
            var inviterVars = utils.getUserInfo(res.locals.user, ['name', 'email']);
            var emailVars = [
              {name: 'INVITER', content: inviterVars.name}
            ];

            if(group.type == 'guild'){
              emailVars.push(
                {name: 'GUILD_NAME', content: group.name},
                {name: 'GUILD_URL', content: '/#/options/groups/guilds/public'}
              );
            }else{
              emailVars.push(
                {name: 'PARTY_NAME', content: group.name},
                {name: 'PARTY_URL', content: '/#/options/groups/party'}
              )
            }

            utils.txnEmail(invite, ('invited-' + (group.type == 'guild' ? 'guild' : 'party')), emailVars);
          }

          cb();
        });
      }
    });
  }, function(err){
    if(err) return err.code ? res.status(err.code).json({err: err.err}) : next(err);

    async.series([
      function(cb) {
        group.save(cb);
      },
      function(cb) {
        // TODO pass group from save above don't find it again, or you have to find it again in order to run populate?
        Group.findById(group._id).populate('leader', nameFields).exec(function (err, savedGroup) {
          if (err) return next(err);
          savedGroup.getTransformedData({
            cb: function (err, transformedGroup) {
              if (err) return next(err);
              res.json(transformedGroup);
            },
            populateMembers: savedGroup.type === 'party' ? partyFields : nameFields,
            populateInvites: nameFields,
            populateChallenges: challengeFields,
          })
        });
      }
    ]);
  });
};

var inviteByEmails = function(invites, group, req, res, next){
  var usersAlreadyRegistered = [];

  async.each(invites, function(invite, cb){
    if (invite.email) {
      User.findOne({$or: [
        {'auth.local.email': invite.email},
        {'auth.facebook.emails.value': invite.email}
      ]}).select({_id: true, 'preferences.emailNotifications': true})
        .exec(function(err, userToContact){
          if(err) return next(err);

          if(userToContact){
            usersAlreadyRegistered.push(userToContact._id);
            return cb();
          }

          // yeah, it supports guild too but for backward compatibility we'll use partyInvite as query

          var link = '?partyInvite='+ utils.encrypt(JSON.stringify({id:group._id, inviter:res.locals.user._id, name:group.name}));

          var inviterVars = utils.getUserInfo(res.locals.user, ['name', 'email']);
          var variables = [
            {name: 'LINK', content: link},
            {name: 'INVITER', content: req.body.inviter || inviterVars.name}
          ];

          if(group.type == 'guild'){
            variables.push({name: 'GUILD_NAME', content: group.name});
          }

          // TODO implement "users can only be invited once"
          // Check for the email address not to be unsubscribed
          EmailUnsubscription.findOne({email: invite.email}, function(err, unsubscribed){
            if(err) return cb(err);
            if(unsubscribed) return cb();

            utils.txnEmail(invite, ('invite-friend' + (group.type == 'guild' ? '-guild' : '')), variables);

            cb();
          });
        });
    }else{
      cb();
    }
  }, function(err){
    if(err) return err.code ? res.status(err.code).json({err: err.err}) : next(err);

    if (usersAlreadyRegistered.length > 0){
      inviteByUUIDs(usersAlreadyRegistered, group, req, res, next);
    } else{

      // Send only status code down the line because it doesn't need
      // info on invited users since they are not yet registered
      res.status(200).json({});
    }
  });
};

api.invite = function(req, res, next){
  var group = res.locals.group;
  let userParty = res.locals.user.party && res.locals.user.party._id;
  let userGuilds = res.locals.user.guilds;

  if (group.type === 'party' && userParty !== group._id) {
    return res.status(401).json({err: "Only a member can invite new members!"});
  }

  if (group.type === 'guild' && group.privacy === 'private' && !_.contains(userGuilds, group._id)) {
    return res.status(401).json({err: "Only a member can invite new members!"});
  }

  if (req.body.uuids) {
    inviteByUUIDs(req.body.uuids, group, req, res, next);
  } else if (req.body.emails) {
    inviteByEmails(req.body.emails, group, req, res, next)
  } else {
    return res.status(400).json({err: "Can only invite by email or uuid"});
  }
}

api.removeMember = function(req, res, next){
  var group = res.locals.group;
  var uuid = req.query.uuid;
  var message = req.query.message;
  var user = res.locals.user;

  // Send an email to the removed user with an optional message from the leader
  var sendMessage = function(removedUser){
    if(removedUser.preferences.emailNotifications.kickedGroup !== false){
      utils.txnEmail(removedUser, ('kicked-from-' + group.type), [
        {name: 'GROUP_NAME', content: group.name},
        {name: 'MESSAGE', content: message},
        {name: 'GUILDS_LINK', content: '/#/options/groups/guilds/public'},
        {name: 'PARTY_WANTED_GUILD', content: '/#/options/groups/guilds/f2db2a7f-13c5-454d-b3ee-ea1f5089e601'}
      ]);
    }
  }

  if(group.leader !== user._id){
    return res.status(401).json({err: "Only group leader can remove a member!"});
  }

  if(user._id === uuid){
    return res.status(401).json({err: "You cannot remove yourself!"});
  }

  User.findById(uuid, function(err, removedUser){
    if (err) return next(err);
    let isMember = group._id === removedUser.party._id || _.contains(removedUser.guilds, group._id);
    let isInvited = group._id === removedUser.invitations.party._id || !!_.find(removedUser.invitations.guilds, {id: group._id});

    if(isMember){
      var update = {};
      if (group.quest && group.quest.leader === uuid) {
        update['$set'] = {
          quest: { key: null, leader: null }
        };
      } else if(group.quest && group.quest.members){
        // remove member from quest
        update['$unset'] = {};
        update['$unset']['quest.members.' + uuid] = "";
      }
      update['$inc'] = {memberCount: -1};
      Group.update({_id:group._id},update, function(err, saved){
        if (err) return next(err);

        sendMessage(removedUser);

        //Mark removed users messages as seen
        var update = {$unset:{}};
        if (group.type === 'guild') {
          update.$pull = {guilds: group._id};
        } else {
          update.$unset.party = true;
        }
        update.$unset['newMessages.' + group._id] = '';
        if (group.quest && group.quest.active && group.quest.leader === uuid) {
          update['$inc'] = {};
          update['$inc']['items.quests.' + group.quest.key] = 1;
        }
        User.update({_id: removedUser._id, apiToken: removedUser.apiToken}, update).exec();

        // Sending an empty 204 because Group.update doesn't return the group
        // see http://mongoosejs.com/docs/api.html#model_Model.update
        group = uuid = null;
        return res.sendStatus(204);
      });
    }else if(isInvited){
      var invitations = removedUser.invitations;
      if(group.type === 'guild'){
        invitations.guilds.splice(_.indexOf(invitations.guilds, group._id), 1);
      }else{
        invitations.party = undefined;
      }

      async.series([
        function(cb){
          removedUser.save(cb);
        },
      ], function(err, results){
        if (err) return next(err);

        // Sending an empty 204 because Group.update doesn't return the group
        // see http://mongoosejs.com/docs/api.html#model_Model.update
        sendMessage(removedUser);
        group = uuid = null;
        return res.sendStatus(204);
      });
    }else{
      group = uuid = null;
      return res.status(400).json({err: "User not found among group's members!"});
    }
  });
}

// ------------------------------------
// Quests
// ------------------------------------
function canStartQuestAutomatically (group)  {
  // If all members are either true (accepted) or false (rejected) return true
  // If any member is null/undefined (undecided) return false
  return _.every(group.quest.members, _.isBoolean);
}

function questStart(req, res, next) {
  var group = res.locals.group;
  var force = req.query.force;

  // if (group.quest.active) return res.status(400).json({err:'Quest already began.'});
  // temporarily send error email, until we know more about this issue (then remove below, uncomment above).
  if (group.quest.active) return next('Quest already began.');

  group.markModified('quest');

  // Not ready yet, wait till everyone's accepted, rejected, or we force-start
  var statuses = _.values(group.quest.members);
  if (!force && (~statuses.indexOf(undefined) || ~statuses.indexOf(null))) {
    return group.save(function(err,saved){
      if (err) return next(err);
      res.json(saved);
    })
  }

  var parallel = [],
    questMembers = {},
    key = group.quest.key,
    quest = shared.content.quests[key],
    collected = quest.collect ? _.transform(quest.collect, function(m,v,k){m[k]=0}) : {};

  _.each(group.members, function(m){
    var updates = {$set:{},$inc:{'_v':1}};
    if (m == group.quest.leader)
      updates['$inc']['items.quests.'+key] = -1;
    if (group.quest.members[m] == true) {
      // See https://github.com/HabitRPG/habitrpg/issues/2168#issuecomment-31556322 , we need to *not* reset party.quest.progress.up
      //updates['$set']['party.quest'] = Group.cleanQuestProgress({key:key,progress:{collect:collected}});
      updates['$set']['party.quest.key'] = key;
      updates['$set']['party.quest.progress.down'] = 0;
      updates['$set']['party.quest.progress.collect'] = collected;
      updates['$set']['party.quest.completed'] = null;
      questMembers[m] = true;

      User.findOne({_id: m}, {pushDevices: 1}, function(err, user){
        pushNotify.sendNotify(user, "HabitRPG", shared.i18n.t('questStarted') + ": "+ quest.text() );
      });
    } else {
      updates['$set']['party.quest'] = Group.cleanQuestProgress();
    }

    parallel.push(function(cb2){
      User.update({_id:m},updates,cb2);
    });
  });

  group.quest.active = true;
  if (quest.boss) {
    group.quest.progress.hp = quest.boss.hp;
    if (quest.boss.rage) group.quest.progress.rage = 0;
  } else {
    group.quest.progress.collect = collected;
  }
  group.quest.members = questMembers;
  group.markModified('quest'); // members & progress.collect are both Mixed types
  parallel.push(function(cb2){group.save(cb2)});

  parallel.push(function(cb){
    // Fetch user.auth to send email, then remove it from data sent to the client
    populateQuery(group.type, Group.findById(group._id), 'auth.facebook auth.local').exec(cb);
  });

  async.parallel(parallel,function(err, results){
    if (err) return next(err);

    var lastIndex = results.length -1;
    var groupClone = clone(group);

    groupClone.members = results[lastIndex].members;

    // Send quest started email
    var usersToEmail = groupClone.members.filter(function(user){
      return (
        user.preferences.emailNotifications.questStarted !== false &&
        user._id !== res.locals.user._id &&
        group.quest.members[user._id] == true
      )
    });

    utils.txnEmail(usersToEmail, 'quest-started', [
      {name: 'PARTY_URL', content: '/#/options/groups/party'}
    ]);

    _.each(groupClone.members, function(user){
      // Remove sensitive data from what is sent to the public
      // but after having sent emails as they are needed
      user.auth.facebook = undefined;
      user.auth.local = undefined;
    });

    group = null;

    return res.json(groupClone);
  });
}

api.questAccept = function(req, res, next) {
  var group = res.locals.group;
  var user = res.locals.user;
  var key = req.query.key;

  if (!group || group.type !== 'party') return res.status(400).json({err: "Must be in a party to start quests."});

  // If ?key=xxx is provided, we're starting a new quest and inviting the party. Otherwise, we're a party member accepting the invitation
  if (key) {
    var quest = shared.content.quests[key];
    if (!quest) return res.status(404).json({err:'Quest ' + key + ' not found'});
    if (quest.lvl && user.stats.lvl < quest.lvl) return res.status(400).json({err: "You must be level "+quest.lvl+" to begin this quest."});
    if (group.quest.key) return res.status(400).json({err: 'Your party is already on a quest. Try again when the current quest has ended.'});
    if (!user.items.quests[key]) return res.status(400).json({err: "You don't own that quest scroll"});

    let members;

    User.find({
      'party._id': group._id,
      _id: {$ne: user._id},
    }).select('auth.facebook auth.local preferences.emailNotifications profile.name pushDevices')
    .exec().then(membersF => {
      members = membersF;

      group.markModified('quest');
      group.quest.key = key;
      group.quest.leader = user._id;
      group.quest.members = {};
      group.quest.members[user._id] = true;

      user.party.quest.RSVPNeeded = false;
      user.party.quest.key = key;

      return User.update({
        'party._id': group._id,
        _id: {$ne: user._id},
      }, {
        $set: {
          'party.quest.RSVPNeeded': true,
          'party.quest.key': key,
        },
      }, {multi: true}).exec();
    }).then(() => {
      _.each(members, (member) => {
        group.quest.members[member._id] = null;
      });

      if (canStartQuestAutomatically(group)) {
        group.startQuest(user).then(() => {
          return Q.all([group.save(), user.save()])
        })
        .then(results => {
          results[0].getTransformedData({
            cb (err, groupTransformed) {
              if (err) return next(err);
              res.json(groupTransformed);
            },
            populateMembers: group.type === 'party' ? partyFields : nameFields,
          });
        })
        .catch(next);

      } else {
        Q.all([group.save(), user.save()])
        .then(results => {
          results[0].getTransformedData({
            cb (err, groupTransformed) {
              if (err) return next(err);
              res.json(groupTransformed);
            },
            populateMembers: group.type === 'party' ? partyFields : nameFields,
          });
        })
        .catch(next);
      }
    }).catch(next);

  // Party member accepting the invitation
  } else {
    group.markModified('quest');
    group.quest.members[user._id] = true;
    user.party.quest.RSVPNeeded = false;

    if (canStartQuestAutomatically(group)) {
      group.startQuest(user).then(() => {
        return Q.all([group.save(), user.save()])
      })
      .then(results => {
        results[0].getTransformedData({
          cb (err, groupTransformed) {
            if (err) return next(err);
            res.json(groupTransformed);
          },
          populateMembers: group.type === 'party' ? partyFields : nameFields,
        });
      })
      .catch(next);

    } else {
      Q.all([group.save(), user.save()])
      .then(results => {
        results[0].getTransformedData({
          cb (err, groupTransformed) {
            if (err) return next(err);
            res.json(groupTransformed);
          },
          populateMembers: group.type === 'party' ? partyFields : nameFields,
        });
      })
      .catch(next);
    }
  }
}

api.questReject = function(req, res, next) {
  var group = res.locals.group;
  var user = res.locals.user;

  group.quest.members[user._id] = false;
  group.markModified('quest.members');

  user.party.quest = Group.cleanQuestProgress();
  user.markModified('party.quest');

  if (canStartQuestAutomatically(group)) {
    group.startQuest(user).then(() => {
      return Q.all([group.save(), user.save()])
    })
    .then(results => {
      results[0].getTransformedData({
        cb (err, groupTransformed) {
          if (err) return next(err);
          res.json(groupTransformed);
        },
        populateMembers: group.type === 'party' ? partyFields : nameFields,
      });
    })
    .catch(next);

  } else {
    Q.all([group.save(), user.save()])
    .then(results => {
      results[0].getTransformedData({
        cb (err, groupTransformed) {
          if (err) return next(err);
          res.json(groupTransformed);
        },
        populateMembers: group.type === 'party' ? partyFields : nameFields,
      });
    })
    .catch(next);
  }
}

api.questCancel = function(req, res, next){
  var group = res.locals.group;

  group.quest = Group.cleanGroupQuest();
  group.markModified('quest');

  Q.all([
    group.save(),
    User.update(
      {'party._id': group._id},
      {$set: {'party.quest': Group.cleanQuestProgress()}},
      {multi: true}
    ),
  ]).then(results => {
    results[0].getTransformedData({
      cb (err, groupTransformed) {
        if (err) return next(err);
        res.json(groupTransformed);
      },
      populateMembers: group.type === 'party' ? partyFields : nameFields,
    });
  }).catch(next);

  // Cancel a quest BEFORE it has begun (i.e., in the invitation stage)
  // Quest scroll has not yet left quest owner's inventory so no need to return it.
  // Do not wipe quest progress for members because they'll want it to be applied to the next quest that's started.
}

api.questAbort = function(req, res, next){
  var group = res.locals.group;

  let memberUpdates = User.update({
    'party._id': group._id,
  }, {
    $set: {'party.quest': Group.cleanQuestProgress()},
    $inc: {_v: 1}, // TODO update middleware
  }, {multi: true}).exec();

  let questLeaderUpdate = User.update({
    _id: group.quest.leader,
  }, {
    $inc: {
      [`items.quests.${group.quest.key}`]: 1, // give back the quest to the quest leader
    },
  }).exec();

  group.quest = Group.cleanGroupQuest();
  group.markModified('quest');

  Q.all([group.save(), memberUpdates, questLeaderUpdate])
  .then(results => {
    results[0].getTransformedData({
      cb (err, groupTransformed) {
        if (err) return next(err);
        res.json(groupTransformed);
      },
      populateMembers: group.type === 'party' ? partyFields : nameFields,
    });
  })
  .catch(next);
}

api.questLeave = function(req, res, next) {
  // Non-member leave quest while still in progress
  var group = res.locals.group;
  var user = res.locals.user;

  if (!(group.quest && group.quest.active)) {
    return res.status(404).json({ err: 'No active quest to leave' });
  }

  if (!(group.quest.members && group.quest.members[user._id])) {
    return res.status(403).json({ err: 'You are not part of the quest' });
  }

  if (group.quest.leader === user._id) {
    return res.status(403).json({ err: 'Quest leader cannot leave quest' });
  }

  group.quest.members[user._id] = false;
  group.markModified('quest.members');

  user.party.quest = Group.cleanQuestProgress();
  user.markModified('party.quest');

  var groupSavePromise = Q.nbind(group.save, group);
  var userSavePromise = Q.nbind(user.save, user);

  Q.all([groupSavePromise(), userSavePromise()])
    .done(function(values) {
      return res.sendStatus(204);
    }, function(error) {
      return next(error);
    });
}

function _purgeFlagInfoFromChat(group, user) {
  group.chat = _.filter(group.chat, function(message) { return !message.flagCount || message.flagCount < 2; });
  _.each(group.chat, function (message) {
    if (message.flags) {
      var userHasFlagged = message.flags[user._id];
      message.flags = {};

      if (userHasFlagged) message.flags[user._id] = userHasFlagged;
    }
  });
}
