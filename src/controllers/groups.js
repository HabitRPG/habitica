// @see ../routes for routing

var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var algos = require('habitrpg-shared/script/algos');
var helpers = require('habitrpg-shared/script/helpers');
var items = require('habitrpg-shared/script/items');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var api = module.exports;

/*
  ------------------------------------------------------------------------
  Groups
  ------------------------------------------------------------------------
*/

var itemFields = 'items.armor items.head items.shield items.weapon items.currentPet items.pets'; // TODO just send down count(items.pets) for better performance
var partyFields = 'profile preferences stats achievements party backer contributor balance flags.rest auth.timestamps ' + itemFields;
var nameFields = 'profile.name';
var challengeFields = '_id name';
var guildPopulate = {path: 'members', select: nameFields, options: {limit: 15} };
/**
 * For parties, we want a lot of member details so we can show their avatars in the header. For guilds, we want very
 * limited fields - and only a sampling of the members, beacuse they can be in the thousands
 * @param type: 'party' or otherwise
 * @param q: the Mongoose query we're building up
 */
var populateQuery = function(type, q){
  if (type == 'party')
    q.populate('members', partyFields);
  else
    q.populate(guildPopulate);
  q.populate('invites', nameFields);
  q.populate('challenges', challengeFields);
  return q;
}


api.getMember = function(req, res) {
  User.findById(req.params.uid).select(partyFields).exec(function(err, user){
    if (err) return res.json(500,{err:err});
    if (!user) return res.json(400,{err:'User not found'});
    res.json(user);
  })
}

api.updateMember = function(req, res) {
  var user = res.locals.user;
  if (!(user.contributor && user.contributor.admin)) return res.json(401, {err:"You don't have access to save this user"});
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
      if (member.contributor.level >= 6 && !member.items.pets['Dragon-Hydra']) member.items.pets['Dragon-Hydra'] = 5;
      member.save(cb);
    }
  ], function(err, saved){
    if (err) return res.json(500,{err:err});
    res.json(204);
  })
}

/**
 * Fetch groups list. This no longer returns party or tavern, as those can be requested indivdually
 * as /groups/party or /groups/tavern
 */
api.list = function(req, res) {
  var user = res.locals.user;
  var groupFields = 'name description memberCount balance leader';
  var sort = '-memberCount';
  var type = req.query.type || 'party,guilds,public,tavern';

  async.parallel({

    // unecessary given our ui-router setup
    party: function(cb){
      if (!~type.indexOf('party')) return cb(null, {});
      Group.findOne({type: 'party', members: {'$in': [user._id]}})
        .select(groupFields).exec(function(err, party){
          if (err) return cb(err);
          cb(null, (party === null ? [] : [party])); // return as an array for consistent ngResource use
        });
    },

    guilds: function(cb) {
      if (!~type.indexOf('guilds')) return cb(null, []);
      Group.find({members: {'$in': [user._id]}, type:'guild'})
        .select(groupFields).sort(sort).exec(cb);
    },

    'public': function(cb) {
      if (!~type.indexOf('public')) return cb(null, []);
      Group.find({privacy: 'public'})
        .select(groupFields + ' members')
        .sort(sort)
        .exec(function(err, groups){
          if (err) return cb(err);
          _.each(groups, function(g){
            // To save some client-side performance, don't send down the full members arr, just send down temp var _isMember
            if (~g.members.indexOf(user._id)) g._isMember = true;
            g.members = undefined;
          });
          cb(null, groups);
        });
    },

    // unecessary given our ui-router setup
    tavern: function(cb) {
      if (!~type.indexOf('tavern')) return cb(null, {});
      Group.findById('habitrpg').select(groupFields).exec(function(err, tavern){
        if (err) return cb(err);
        cb(null, [tavern]); // return as an array for consistent ngResource use
      });
    }

  }, function(err, results){
    if (err) return res.json(500, {err: err});
    // ngResource expects everything as arrays. We used to send it down as a structured object: {public:[], party:{}, guilds:[], tavern:{}}
    // but unfortunately ngResource top-level attrs are considered the ngModels in the list, so we had to do weird stuff and multiple
    // requests to get it to work properly. Instead, we're not depending on the client to do filtering / organization, and we're
    // just sending down a merged array. Revisit
    var arr = _.reduce(results, function(m,v){
      if (_.isEmpty(v)) return m;
      return m.concat(_.isArray(v) ? v : [v]);
    }, [])
    res.json(arr);
  })
};

/**
 * Get group
 * TODO: implement requesting fields ?fields=chat,members
 */
api.get = function(req, res) {
  var user = res.locals.user;
  var gid = req.params.gid;

  var q = (gid == 'party') ? Group.findOne({type: 'party', members: {'$in': [user._id]}}) : Group.findById(gid);
  populateQuery(gid, q);
  q.exec(function(err, group){
    if (group && ((group.type == 'guild' && group.privacy == 'private') || (group.type == 'party'))) {
      if(!_.find(group.members, {_id: user._id}))
        return res.json(401, {err: "You don't have access to this group"});
    }
    res.json(group);
  });
};


api.create = function(req, res, next) {
  var group = new Group(req.body);
  var user = res.locals.user;

  if(group.type === 'guild'){
    if(user.balance < 1) return res.json(401, {err: 'Not enough gems!'});

    group.balance = 1;
    user.balance--;

    user.save(function(err){
      if(err) return res.json(500,{err:err});
      group.save(function(err, saved){
        if (err) return res.json(500,{err:err});
        saved.populate('members', nameFields, function(err, populated){
          if (err) return res.json(500,{err:err});
          return res.json(populated);
        });
      });
    });    
  }else{
    group.save(function(err, saved){
      if (err) return res.json(500,{err:err});
      saved.populate('members', nameFields, function(err, populated){
        if (err) return res.json(500,{err:err});
        return res.json(populated);
      });
    });
  }
}

api.update = function(req, res, next) {
  var group = res.locals.group;
  var user = res.locals.user;

  if(group.leader !== user._id)
    return res.json(401, {err: "Only the group leader can update the group!"});

  'name description logo websites logo leaderMessage leader'.split(' ').forEach(function(attr){
    group[attr] = req.body[attr];
  });

  group.save(function(err, saved){
    if (err) return res.json(500,{err:err});

    res.send(204);
  });
}

api.attachGroup = function(req, res, next) {
  Group.findById(req.params.gid, function(err, group){
    if(err) return res.json(500, {err:err});
    res.locals.group = group;
    next();
  })
}

/**
 * TODO make this it's own ngResource so we don't have to send down group data with each chat post
 */
api.postChat = function(req, res, next) {
  var user = res.locals.user
  var group = res.locals.group;
  var message = {
    id: helpers.uuid(),
    uuid: user._id,
    contributor: user.contributor && user.contributor.toObject(),
    backer: user.backer && user.backer.toObject(),
    text: req.query.message, // FIXME this should be body, but ngResource is funky
    user: user.profile.name,
    timestamp: +(new Date)
  };

  var lastClientMsg = req.query.previousMsg;
  var chatUpdated = (lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg) ? true : false;

  group.chat.unshift(message);
  group.chat.splice(200);

  if (group.type === 'party') {
    user.party.lastMessageSeen = message.id;
    user.save();
  }

  group.save(function(err, saved){
    if (err) return res.json(500, {err:err});

    return chatUpdated ? res.json({chat: group.chat}) : res.json({message: saved.chat[0]});
  });
}

api.deleteChatMessage = function(req, res){
  var user = res.locals.user
  var group = res.locals.group;
  var message = _.find(group.chat, {id: req.params.messageId});

  if(!message) return res.json(404, {err: "Message not found!"});

  if(user._id !== message.uuid && !(user.backer && user.contributor.admin))
    return res.json(401, {err: "Not authorized to delete this message!"})

  var lastClientMsg = req.query.previousMsg;
  var chatUpdated = (lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg) ? true : false;

  Group.update({_id:group._id}, {$pull:{chat:{id: req.params.messageId}}}, function(err){
    if(err) return res.json(500, {err: err});
    return chatUpdated ? res.json({chat: group.chat}) : res.send(204);
  });
}

api.join = function(req, res) {
  var user = res.locals.user,
    group = res.locals.group;

  if (group.type == 'party' && group._id == (user.invitations && user.invitations.party && user.invitations.party.id)) {
    user.invitations.party = undefined;
    user.save();
  }
  else if (group.type == 'guild' && user.invitations && user.invitations.guilds) {
    var i = _.findIndex(user.invitations.guilds, {id:group._id});
    if (~i) user.invitations.guilds.splice(i,1);
    user.save();
  }

  if (!_.contains(group.members, user._id)){
    group.members.push(user._id);
    group.invites.splice(_.indexOf(group.invites, user._id), 1);
  }

  async.series([
    function(cb){
      group.save(cb);
    },
    function(cb){
      populateQuery(group.type, Group.findById(group._id)).exec(cb);
    }
  ], function(err, results){
    if (err) return res.json(500,{err:err});

    // Return the group? Or not?
    res.json(results[1]);
  });
}

api.leave = function(req, res, next) {
  var user = res.locals.user,
    group = res.locals.group;

  Group.update({_id:group._id},{$pull:{members:user._id}}, function(err, saved){
    if (err) return res.json(500,{err:err});
    return res.send(204);
  });
}

api.invite = function(req, res, next) {
  var group = res.locals.group;
  var uuid = req.query.uuid;
  var user = res.locals.user;

  User.findById(uuid, function(err,invite){
    if (err) return res.json(500,{err:err});
    if (!invite)
       return res.json(400,{err:'User with id "' + uuid + '" not found'});
    if (group.type == 'guild') {
      if (_.contains(group.members,uuid))
        return res.json(400,{err: "User already in that group"});
      if (invite.invitations && invite.invitations.guilds && _.find(invite.invitations.guilds, {id:group._id}))
        return res.json(400, {err:"User already invited to that group"});
      sendInvite();
    } else if (group.type == 'party') {
      if (invite.invitations && !_.isEmpty(invite.invitations.party))
        return res.json(400,{err:"User already pending invitation."});
      Group.find({type:'party', members:{$in:[uuid]}}, function(err, groups){
        if (err) return res.json(500,{err:err});
        if (!_.isEmpty(groups))
          return res.json(400,{err:"User already in a party."})
        sendInvite();
      });
    }

    function sendInvite (){
      if(group.type === 'guild'){
        invite.invitations.guilds.push({id: group._id, name: group.name});
      }else{
        //req.body.type in 'guild', 'party'
        invite.invitations.party = {id: group._id, name: group.name}
      }

      group.invites.push(invite._id);

      async.series([
        function(cb){
          invite.save(cb);
        },
        function(cb){
          group.save(cb);
        },
        function(cb){
          populateQuery(group.type, Group.findById(group._id)).exec(cb);
        }
      ], function(err, results){
        if (err) return res.json(500,{err:err});

        // Have to return whole group and its members for angular to show the invited user
        res.json(results[2]);
      });
    }
  });
}

api.removeMember = function(req, res, next){
  var group = res.locals.group;
  var uuid = req.query.uuid;
  var user = res.locals.user;
  
  if(group.leader !== user._id){
    return res.json(401, {err: "Only group leader can remove a member!"});
  }

  if(_.contains(group.members, uuid)){
    Group.update({_id:group._id},{$pull:{members:uuid}}, function(err, saved){
      if (err) return res.json(500,{err:err});
      
      // Sending an empty 204 because Group.update doesn't return the group
      // see http://mongoosejs.com/docs/api.html#model_Model.update
      return res.send(204);
    });
  }else if(_.contains(group.invites, uuid)){
    User.findById(uuid, function(err,invited){
      var invitations = invited.invitations;
      if(group.type === 'guild'){
        invitations.guilds.splice(_.indexOf(invitations.guilds, group._id), 1);
      }else{
        invitations.party = undefined;
      }

      async.series([
        function(cb){
          invited.save(cb);
        },
        function(cb){
          Group.update({_id:group._id},{$pull:{invites:uuid}}, cb);
        }
      ], function(err, results){
        if (err) return res.json(500,{err:err});

        // Sending an empty 204 because Group.update doesn't return the group
        // see http://mongoosejs.com/docs/api.html#model_Model.update
        return res.send(204);
      });

    });
  }else{
    return res.json(400, {err: "User not found among group's members!"});
  }

}