import { authWithHeaders } from '../../middlewares/auth';
import {
  model as User,
  publicFields as memberFields,
  nameFields,
} from '../../models/user';
import { model as Group } from '../../models/group';
import { model as Challenge } from '../../models/challenge';
import {
  NotFound,
  NotAuthorized,
} from '../../libs/errors';
import * as Tasks from '../../models/task';
import {
  getUserInfo,
  sendTxn as sendTxnEmail,
} from '../../libs/email';
import Bluebird from 'bluebird';
import sendPushNotification from '../../libs/pushNotifications';

let api = {};

/**
 * @api {get} /api/v3/members/:memberId Get a member profile
 * @apiVersion 3.0.0
 * @apiName GetMember
 * @apiGroup Member
 *
 * @apiParam {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The member object
 */
api.getMember = {
  method: 'GET',
  url: '/members/:memberId',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;

    let member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    // manually call toJSON with minimize: true so empty paths aren't returned
    let memberToJSON = member.toJSON({minimize: true});
    member.addComputedStatsToJSONObj(memberToJSON);

    res.respond(200, memberToJSON);
  },
};

function _addAchievement(achievementsResult, type, key, title, text, icon, category, value, earned) {
  achievementsResult[key] = {
    type,
    title,
    text,
    icon,
    category,
    key,
    value,
    earned,
    index: achievementsResult._count++,
  };
}

function _addSimpleAchievement (res, memberObj, achievementsResult, key, icon, category, keySuffixOrLabels, alreadyParsed) {
  let value = memberObj.achievements[key];
  let isEarned = !!value;

  let labels = {
    title: key,
    text: key + 'Text',
  };

  if (keySuffixOrLabels instanceof Object) {
    labels.title = keySuffixOrLabels.title;
    labels.text = keySuffixOrLabels.text;
  } else if (!keySuffixOrLabels) {
    labels.title = key + keySuffixOrLabels;
  }

  if(!alreadyParsed){
    labels.title = res.t(labels.title);
    labels.text = res.t(labels.text);
  }

  _addAchievement(achievementsResult, 'simple', key, labels.title, labels.text, icon, category, value, isEarned);
}

function _addSimpleAchievementWithCount (res, memberObj, achievementsResult, key, icon, category, labels) {
  let value = memberObj.achievements[key];
  let isEarned = !!value;

  if (!labels) {
    labels = {
      title: key + 'Name',
      text: key + 'Text',
    };
  }

  _addAchievement(achievementsResult, 'simple', key, res.t(labels.title), res.t(labels.text, {count: value}), icon, category, value, isEarned);
}

function _addSimpleAchievementWithMasterCount (res, memberObj, achievementsResult, key, icon, category) {
  let value = memberObj.achievements[key + 'Count'];
  let isEarned = !!value;

  let text = res.t(key + 'Text') + (value == 0 ? '' : res.t(key + 'Text2', {count: value}));

  _addAchievement(achievementsResult, 'simple', key, res.t(key + 'Name'), text, icon, category, value, isEarned);
}


function _addPluralAchievement (res, memberObj, achievementsResult, key, icon, category, keyToCheck, labels) {
  if (!keyToCheck)
    keyToCheck = key;

  let value = memberObj.achievements[keyToCheck];
  let isEarned = !!value;

  // value == 0, labels.singularTitle, labels.singularText
  // value != 0, labels.pluralTitle, labels.pluralText

  if(!labels){
    labels = {
      singularTitle: key+'Singular',
      singularText: key+'SingularText',

      pluralTitle: key+'Name',
      pluralText: key+'Text'
    };
  }

  let title = res.t(value == 0 ? labels.singularTitle : labels.pluralTitle, {count: value});
  let text = res.t(value == 0 ? labels.singularText : labels.pluralText, {count: value});

  _addAchievement(achievementsResult, 'plural', key, title, text, icon, category, value, isEarned);
}

function _addUltimateGearAchievement (res, memberObj, achievementsResult, key, icon, category, keyToCheck) {
  if (!keyToCheck)
    keyToCheck = key;

  let value = memberObj.achievements.ultimateGearSets[keyToCheck];
  let isEarned = !!value;

  let title = res.t('ultimGearName', {ultClass: res.t(key)});
  let text = res.t(key + 'UltimGearText');

  _addAchievement(achievementsResult, 'ultimateGear', 'ultimateGear' + key, title, text, icon, category, value, isEarned);
}

/**
 * @api {get} /api/v3/members/:memberId/achievements Get member achievements object
 * @apiVersion 3.0.0
 * @apiName GetMemberAchievements
 * @apiGroup Member
 *
 * @apiParam {UUID} memberId The member's id
 *
 * @apiSuccess {Object} data The Achievements object
 */
api.getMemberAchievements = {
  method: 'GET',
  url: '/members/:memberId/achievements',
  middlewares: [],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;

    let member = await User
      .findById(memberId)
      .select(memberFields)
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    let achievements = fillAchievements(member, res);

    res.respond(200, achievements);
  },
};

// copy from rootCtrl => $scope.contribText
function contribText(contrib, backer, res){
  if (!contrib && !backer) return;
  if (backer && backer.npc) return backer.npc;
  var l = contrib && contrib.level;
  if (l && l > 0) {
    var level = (l < 3) ? res.t('friend') : (l < 5) ? res.t('elite') : (l < 7) ? res.t('champion') : (l < 8) ? res.t('legendary') : (l < 9) ? res.t('guardian') : res.t('heroic');
    return level + ' ' + contrib.text;
  }
}

function fillAchievements (member, res) {
  var achievements = {
    _count: 0,
  };

  // Basic Achievements
  _addPluralAchievement(res, member, achievements, 'streak', 'achievement-thermometer', 'Basic');
  _addPluralAchievement(res, member, achievements, 'perfect', 'achievement-perfect', 'Basic');

  _addSimpleAchievement(res, member, achievements, 'partyUp', 'achievement-partyUp', 'Basic', 'Name');
  _addSimpleAchievement(res, member, achievements, 'partyOn', 'achievement-partyOn', 'Basic', 'Name');

  _addSimpleAchievementWithMasterCount(res, member, achievements, 'beastMaster', 'achievement-rat', 'Basic');
  _addSimpleAchievementWithMasterCount(res, member, achievements, 'mountMaster', 'achievement-wolf', 'Basic');
  _addSimpleAchievementWithMasterCount(res, member, achievements, 'triadBingo', 'achievement-triadbingo', 'Basic');

  _addUltimateGearAchievement(res, member, achievements, 'healer', 'achievement-ultimate-healer', 'Basic');
  _addUltimateGearAchievement(res, member, achievements, 'rogue', 'achievement-ultimate-rogue', 'Basic');
  _addUltimateGearAchievement(res, member, achievements, 'warrior', 'achievement-ultimate-warrior', 'Basic');
  _addUltimateGearAchievement(res, member, achievements, 'mage', 'achievement-ultimate-mage', 'Basic', 'wizard');

  // TODO Rebirth Achievement

  // Seasonal-Achievements
  _addPluralAchievement(res, member, achievements, 'habiticaDays', 'achievement-habiticaDay', 'Seasonal', 'habiticaDays', {
    singularTitle: 'habiticaDay',
    singularText: 'habiticaDaySingularText',
    pluralTitle: 'habiticaDay',
    pluralText: 'habiticaDayPluralText',
  });

  _addPluralAchievement(res, member, achievements, 'habitBirthdays', 'achievement-habitBirthday', 'Seasonal', 'habitBirthdays', {
    singularTitle: 'habitBirthday',
    singularText: 'habitBirthdayText',
    pluralTitle: 'habitBirthday',
    pluralText: 'habitBirthdayPluralText',
  });

  _addSimpleAchievementWithCount(res, member, achievements, 'snowball', 'achievement-snowball', 'Seasonal', {
    title: 'annoyingFriends',
    text: 'annoyingFriendsText',
  });

  _addSimpleAchievementWithCount(res, member, achievements, 'spookySparkles', 'achievement-spookySparkles', 'Seasonal', {
    title: 'alarmingFriends',
    text: 'alarmingFriendsText',
  });
  _addSimpleAchievementWithCount(res, member, achievements, 'shinySeed', 'achievement-shinySeed', 'Seasonal', {
    title: 'agriculturalFriends',
    text: 'agriculturalFriendsText',
  });
  _addSimpleAchievementWithCount(res, member, achievements, 'seafoam', 'achievement-seafoam', 'Seasonal', {
    title: 'aquaticFriends',
    text: 'aquaticFriendsText',
  });

  _addSimpleAchievement(res, member, achievements, 'quests.dilatory', 'achievement-dilatory', 'Seasonal', {
    title: 'achievementDilatory',
    text: 'achievementDilatoryText',
  });

  _addSimpleAchievement(res, member, achievements, 'quests.stressbeast', 'achievement-stoikalm', 'Seasonal', {
    title: 'achievementStressbeast',
    text: 'achievementStressbeastText',
  });

  _addSimpleAchievement(res, member, achievements, 'quests.burnout', 'achievement-burnout', 'Seasonal', {
    title: 'achievementBurnout',
    text: 'achievementBurnoutText',
  });

  _addSimpleAchievement(res, member, achievements, 'quests.bewilder', 'achievement-bewilder', 'Seasonal', {
    title: 'achievementBewilder',
    text: 'achievementBewilderText',
  });

  _addPluralAchievement(res, member, achievements, 'costumeContests', 'achievement-costumeContest', 'Seasonal', 'costumeContests', {
    singularTitle: 'costumeContest',
    singularText: 'costumeContestText',
    pluralTitle: 'costumeContest',
    pluralText: 'costumeContestTextPlural',
  });

  let cardAchievements = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday'];

  for (let index in cardAchievements) {
    let key = cardAchievements[index];

    _addSimpleAchievementWithCount(res, member, achievements, key, 'achievement-' + key, 'Seasonal', {
      title: key + 'CardAchievementTitle',
      text: key + 'CardAchievementText',
    });
  }

  // Special Achievements
  
  _addPluralAchievement(res, member, achievements, 'habitSurveys', 'achievement-tree', 'Special', undefined, {
    singularTitle: 'helped',
    singularText: 'surveysSingle',
    pluralTitle: 'helped',
    pluralText: 'surveysMultiple',
  });


  if(member.contributor.level) {
    _addAchievement(achievements, 'simple', 'contributor', contribText(member.contributor, member.backer, res), 
      res.t('contribText'), 'achievement-boot', 'Special', member.contributor.level, true);
  } else {
    _addAchievement(achievements, 'simple', 'contributor', res.t('contribName'), 
      res.t('contribText'), 'achievement-boot', 'Special', member.contributor.level, false);
  }

  if(member.backer.npc){
    _addAchievement(achievements, 'simple', 'npc', member.backer.npc + res.t('npc'), 
      res.t('npcText'), 'achievement-ultimate-warrior', 'Special', member.backer.npc);
  }

  if(member.backer.tier){
    _addAchievement(achievements, 'simple', 'tier', res.t('kickstartName', {tier: member.backer.tier}), 
      res.t('kickstartText'), 'achievement-heart', 'Special', member.backer.tier);
  }

  if(member.achievements.veteran){
    _addAchievement(achievements, 'simple', 'veteran', res.t('veteran'), 
      res.t('veteranText'), 'achievement-cake', 'Special', member.achievements.veteran);
  }

  if(member.achievements.originalUser){
    _addAchievement(achievements, 'simple', 'veteran', res.t('originalUser'), 
      res.t('originalUserText'), 'achievement-alpha', 'Special', member.achievements.originalUser);
  }

  return achievements;
}

// Return a request handler for getMembersForGroup / getInvitesForGroup / getMembersForChallenge
// type is `invites` or `members`
function _getMembersForItem (type) {
  if (['group-members', 'group-invites', 'challenge-members'].indexOf(type) === -1) {
    throw new Error('Type must be one of "group-members", "group-invites", "challenge-members"');
  }

  return async function handleGetMembersForItem (req, res) {
    if (type === 'challenge-members') {
      req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    } else {
      req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    }
    req.checkQuery('lastId').optional().notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let groupId = req.params.groupId;
    let challengeId = req.params.challengeId;
    let lastId = req.query.lastId;
    let user = res.locals.user;
    let challenge;
    let group;

    if (type === 'challenge-members') {
      challenge = await Challenge.findById(challengeId).select('_id type leader group').exec();
      if (!challenge) throw new NotFound(res.t('challengeNotFound'));

      // optionalMembership is set to true because even if you're not member of the group you may be able to access the challenge
      // for example if you've been booted from it, are the leader or a site admin
      group = await Group.getGroup({
        user,
        groupId: challenge.group,
        fields: '_id type privacy',
        optionalMembership: true,
      });

      if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    } else {
      group = await Group.getGroup({user, groupId, fields: '_id type'});
      if (!group) throw new NotFound(res.t('groupNotFound'));
    }

    let query = {};
    let fields = nameFields;
    let addComputedStats = false; // add computes stats to the member info when items and stats are available

    if (type === 'challenge-members') {
      query.challenges = challenge._id;
    } else if (type === 'group-members') {
      if (group.type === 'guild') {
        query.guilds = group._id;
      } else {
        query['party._id'] = group._id; // group._id and not groupId because groupId could be === 'party'

        if (req.query.includeAllPublicFields === 'true') {
          fields = memberFields;
          addComputedStats = true;
        }
      }
    } else if (type === 'group-invites') {
      if (group.type === 'guild') { // eslint-disable-line no-lonely-if
        query['invitations.guilds.id'] = group._id;
      } else {
        query['invitations.party.id'] = group._id; // group._id and not groupId because groupId could be === 'party'
      }
    }

    if (lastId) query._id = {$gt: lastId};

    let limit = 30;

    // Allow for all challenges members to be returned
    if (type === 'challenge-members' && req.query.includeAllMembers === 'true') {
      limit = 0; // no limit
    }

    let members = await User
      .find(query)
      .sort({_id: 1})
      .limit(limit)
      .select(fields)
      .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    let membersToJSON = members.map(member => {
      let memberToJSON = member.toJSON({minimize: true});
      if (addComputedStats) member.addComputedStatsToJSONObj(memberToJSON);

      return memberToJSON;
    });
    res.respond(200, membersToJSON);
  };
}

/**
 * @api {get} /api/v3/groups/:groupId/members Get members for a group
 * @apiDescription With a limit of 30 member per request. To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiVersion 3.0.0
 * @apiName GetMembersForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 * @apiParam {boolean} includeAllPublicFields Query parameter available only when fetching a party. If === `true` then all public fields for members will be returned (liek when making a request for a single member)
 *
 * @apiSuccess {array} data An array of members, sorted by _id
 */
api.getMembersForGroup = {
  method: 'GET',
  url: '/groups/:groupId/members',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-members'),
};

/**
 * @api {get} /api/v3/groups/:groupId/invites Get invites for a group
 * @apiDescription With a limit of 30 member per request. To get all invites run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * @apiVersion 3.0.0
 * @apiName GetInvitesForGroup
 * @apiGroup Member
 *
 * @apiParam {UUID} groupId The group id
 * @apiParam {UUID} lastId Query parameter to specify the last invite returned in a previous request to this route and get the next batch of results
 *
 * @apiSuccess {array} data An array of invites, sorted by _id
 */
api.getInvitesForGroup = {
  method: 'GET',
  url: '/groups/:groupId/invites',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('group-invites'),
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members Get members for a challenge
 * @apiDescription With a limit of 30 member per request.
 * To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results.
 * BETA You can also use ?includeAllMembers=true. This option is currently in BETA and may be removed in future.
 * Its use is discouraged and its performaces are not optimized especially for large challenges.
 *
 * @apiVersion 3.0.0
 * @apiName GetMembersForChallenge
 * @apiGroup Member
 *
 * @apiParam {UUID} challengeId The challenge id
 * @apiParam {UUID} lastId Query parameter to specify the last member returned in a previous request to this route and get the next batch of results
 * @apiParam {String} includeAllMembers BETA Query parameter - If 'true' all challenge members are returned

 * @apiSuccess {array} data An array of members, sorted by _id
 */
api.getMembersForChallenge = {
  method: 'GET',
  url: '/challenges/:challengeId/members',
  middlewares: [authWithHeaders()],
  handler: _getMembersForItem('challenge-members'),
};

/**
 * @api {get} /api/v3/challenges/:challengeId/members/:memberId Get a challenge member progress
 * @apiVersion 3.0.0
 * @apiName GetChallengeMemberProgress
 * @apiGroup Member
 *
 * @apiParam {UUID} challengeId The challenge _id
 * @apiParam {UUID} member The member _id
 *
 * @apiSuccess {Object} data Return an object with member _id, profile.name and a tasks object with the challenge tasks for the member
 */
api.getChallengeMemberProgress = {
  method: 'GET',
  url: '/challenges/:challengeId/members/:memberId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let challengeId = req.params.challengeId;
    let memberId = req.params.memberId;

    let member = await User.findById(memberId).select(`${nameFields} challenges`).exec();
    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));

    let challenge = await Challenge.findById(challengeId).exec();
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));

    // optionalMembership is set to true because even if you're not member of the group you may be able to access the challenge
    // for example if you've been booted from it, are the leader or a site admin
    let group = await Group.getGroup({user, groupId: challenge.group, fields: '_id type privacy', optionalMembership: true});
    if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.isMember(member)) throw new NotFound(res.t('challengeMemberNotFound'));

    let chalTasks = await Tasks.Task.find({
      userId: memberId,
      'challenge.id': challengeId,
    })
    .select('-tags') // We don't want to return the tags publicly TODO same for other data?
    .exec();

    // manually call toJSON with minimize: true so empty paths aren't returned
    let response = member.toJSON({minimize: true});
    delete response.challenges;
    response.tasks = chalTasks.map(chalTask => chalTask.toJSON({minimize: true}));
    res.respond(200, response);
  },
};

/**
 * @api {posts} /api/v3/members/send-private-message Send a private message to a member
 * @apiVersion 3.0.0
 * @apiName SendPrivateMessage
 * @apiGroup Member
 *
 * @apiParam {String} message Body parameter - The message
 * @apiParam {UUID} toUserId Body parameter - The user to contact
 *
 * @apiSuccess {Object} data An empty Object
 */
api.sendPrivateMessage = {
  method: 'POST',
  url: '/members/send-private-message',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('message', res.t('messageRequired')).notEmpty();
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;
    let message = req.body.message;

    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    let userBlockedSender = receiver.inbox.blocks.indexOf(sender._id) !== -1;
    let userIsBlockBySender = sender.inbox.blocks.indexOf(receiver._id) !== -1;
    let userOptedOutOfMessaging = receiver.inbox.optOut;

    if (userBlockedSender || userIsBlockBySender || userOptedOutOfMessaging) {
      throw new NotAuthorized(res.t('notAuthorizedToSendMessageToThisUser'));
    }

    await sender.sendMessage(receiver, message);

    if (receiver.preferences.emailNotifications.newPM !== false) {
      sendTxnEmail(receiver, 'new-pm', [
        {name: 'SENDER', content: getUserInfo(sender, ['name']).name},
        {name: 'PMS_INBOX_URL', content: '/#/options/groups/inbox'},
      ]);
    }
    if (receiver.preferences.pushNotifications.newPM !== false) {
      sendPushNotification(
        receiver,
        {
          title: res.t('newPM'),
          message: res.t('newPMInfo', {name: getUserInfo(sender, ['name']).name, message}),
          identifier: 'newPM',
          category: 'newPM',
          payload: {replyTo: sender._id},
        }
      );
    }

    res.respond(200, {});
  },
};

/**
 * @api {posts} /api/v3/members/transfer-gems Send a gem gift to a member
 * @apiVersion 3.0.0
 * @apiName TransferGems
 * @apiGroup Member
 *
 * @apiParam {String} message Body parameter The message
 * @apiParam {UUID} toUserId Body parameter The toUser _id
 * @apiParam {Integer} gemAmount Body parameter The number of gems to send
 *
 * @apiSuccess {Object} data An empty Object
 */
api.transferGems = {
  method: 'POST',
  url: '/members/transfer-gems',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();
    req.checkBody('gemAmount', res.t('gemAmountRequired')).notEmpty().isInt();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let sender = res.locals.user;

    let receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));

    if (receiver._id === sender._id) {
      throw new NotAuthorized(res.t('cannotSendGemsToYourself'));
    }

    let gemAmount = req.body.gemAmount;
    let amount = gemAmount / 4;

    if (amount <= 0 || sender.balance < amount) {
      throw new NotAuthorized(res.t('badAmountOfGemsToSend'));
    }

    receiver.balance += amount;
    sender.balance -= amount;
    let promises = [receiver.save(), sender.save()];
    await Bluebird.all(promises);

    let message = res.t('privateMessageGiftIntro', {
      receiverName: receiver.profile.name,
      senderName: sender.profile.name,
    });
    message += res.t('privateMessageGiftGemsMessage', {gemAmount});
    message =  `\`${message}\` `;

    if (req.body.message) {
      message += req.body.message;
    }

    await sender.sendMessage(receiver, message);

    let byUsername = getUserInfo(sender, ['name']).name;

    if (receiver.preferences.emailNotifications.giftedGems !== false) {
      sendTxnEmail(receiver, 'gifted-gems', [
        {name: 'GIFTER', content: byUsername},
        {name: 'X_GEMS_GIFTED', content: gemAmount},
      ]);
    }
    if (receiver.preferences.pushNotifications.giftedGems !== false) {
      sendPushNotification(receiver,
        {
          title: res.t('giftedGems'),
          message: res.t('giftedGemsInfo', {amount: gemAmount, name: byUsername}),
          identifier: 'giftedGems',
          payload: {replyTo: sender._id},
        });
    }

    res.respond(200, {});
  },
};


module.exports = api;
