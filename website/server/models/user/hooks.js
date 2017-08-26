import shared from '../../../common';
import _ from 'lodash';
import moment from 'moment';
import Bluebird from 'bluebird';
import baseModel from '../../libs/baseModel';
import * as Tasks from '../task';

import schema from './schema';

schema.plugin(baseModel, {
  // noSet is not used as updating uses a whitelist and creating only accepts specific params (password, email, username, ...)
  noSet: [],
  private: ['auth.local.hashed_password', 'auth.local.passwordHashMethod', 'auth.local.salt', '_cronSignature', '_ABtests'],
  toJSONTransform: function userToJSON (plainObj, originalDoc) {
    plainObj._tmp = originalDoc._tmp; // be sure to send down drop notifs
    delete plainObj.filters;

    return plainObj;
  },
});

schema.post('init', function postInitUser (doc) {
  shared.wrap(doc);
});

function findTag (user, tagName) {
  let tagID = _.find(user.tags, (userTag) => {
    return userTag.name === tagName(user.preferences.language);
  });
  return tagID.id;
}

function _populateDefaultTasks (user, taskTypes) {
  let defaultsData;
  if (user.registeredThrough === 'habitica-android' || user.registeredThrough === 'habitica-ios') {
    defaultsData = shared.content.userDefaultsMobile;
    user.flags.welcomed = true;
  } else {
    defaultsData = shared.content.userDefaults;
  }
  let tagsI = taskTypes.indexOf('tag');

  if (tagsI !== -1) {
    user.tags = _.map(defaultsData.tags, (tag) => {
      let newTag = _.cloneDeep(tag);

      // tasks automatically get _id=helpers.uuid() from TaskSchema id.default, but tags are Schema.Types.Mixed - so we need to manually invoke here
      newTag.id = shared.uuid();
      // Render tag's name in user's language
      newTag.name = newTag.name(user.preferences.language);
      return newTag;
    });
  }

  // @TODO: default tasks are handled differently now, and not during registration. We should move this code

  let tasksToCreate = [];
  if (user.registeredThrough === 'habitica-web') return Bluebird.all(tasksToCreate);

  if (tagsI !== -1) {
    taskTypes = _.clone(taskTypes);
    taskTypes.splice(tagsI, 1);
  }

  _.each(taskTypes, (taskType) => {
    let tasksOfType = _.map(defaultsData[`${taskType}s`], (taskDefaults) => {
      let newTask = new Tasks[taskType](taskDefaults);

      newTask.userId = user._id;
      newTask.text = taskDefaults.text(user.preferences.language);
      if (newTask.notes) newTask.notes = taskDefaults.notes(user.preferences.language);
      if (taskDefaults.checklist) {
        newTask.checklist = _.map(taskDefaults.checklist, (checklistItem) => {
          checklistItem.text = checklistItem.text(user.preferences.language);
          return checklistItem;
        });
      }

      if (taskDefaults.tags) {
        newTask.tags = _.compact(_.map(taskDefaults.tags, _.partial(findTag, user)));
      }

      return newTask.save();
    });

    tasksToCreate.push(...tasksOfType);
  });

  return Bluebird.all(tasksToCreate)
    .then((tasksCreated) => {
      _.each(tasksCreated, (task) => {
        user.tasksOrder[`${task.type}s`].push(task._id);
      });
    });
}

function pinBaseItems (user) {
  const itemsPaths = [
    'weapon_warrior_0', 'armor_warrior_1',
    'shield_warrior_1', 'head_warrior_1',
  ];

  itemsPaths.map(p => user.pinnedItems.push({
    type: 'marketGear',
    path: `gear.flat.${p}`,
  }));

  user.pinnedItems.push(
    {type: 'potion', path: 'potion'},
    {type: 'armoire', path: 'armoire'},
  );
}

function _setUpNewUser (user) {
  let taskTypes;
  let iterableFlags = user.flags.toObject();

  // A/B test 2017-05-11: Can we encourage people to join Guilds with a pester modal?
  let testGroup = Math.random();
  if (testGroup < 0.1) {
    user._ABtests.guildReminder = '20170511_noGuildReminder'; // control group, don't pester about Guilds
    user._ABtests.counter = -1;
  } else if (testGroup < 0.235) {
    user._ABtests.guildReminder = '20170511_text1timing1'; // first sample text, show after two clicks
    user._ABtests.counter = 0;
  } else if (testGroup < 0.46) {
    user._ABtests.guildReminder = '20170511_text2timing1'; // second sample text, show after two clicks
    user._ABtests.counter = 0;
  } else if (testGroup < 0.685) {
    user._ABtests.guildReminder = '20170511_text1timing2'; // first sample text, show after five clicks
    user._ABtests.counter = 0;
  } else {
    user._ABtests.guildReminder = '20170511_text2timing2'; // second sample text, show after five clicks
    user._ABtests.counter = 0;
  }

  user.items.quests.dustbunnies = 1;
  user.purchased.background.violet = true;
  user.preferences.background = 'violet';

  if (user.registeredThrough === 'habitica-web') {
    taskTypes = ['habit', 'daily', 'todo', 'reward', 'tag'];

    _.each(iterableFlags.tutorial.common, (val, section) => {
      user.flags.tutorial.common[section] = true;
    });
  } else {
    user.flags.showTour = false;

    _.each(iterableFlags.tour, (val, section) => {
      user.flags.tour[section] = -2;
    });

    if (user.registeredThrough === 'habitica-android' || user.registeredThrough === 'habitica-ios') {
      taskTypes = ['habit', 'daily', 'todo', 'reward', 'tag'];
    } else {
      taskTypes = ['todo', 'tag'];
    }
  }

  pinBaseItems(user);
  return _populateDefaultTasks(user, taskTypes);
}

function _getFacebookName (fb) {
  if (!fb) {
    return;
  }
  let possibleName = fb.displayName || fb.name || fb.username;

  if (possibleName) {
    return possibleName;
  }

  if (fb.first_name && fb.last_name) {
    return `${fb.first_name} ${fb.last_name}`;
  }
}

function _setProfileName (user) {
  let google = user.auth.google;

  let localUsername = user.auth.local && user.auth.local.username;
  let googleUsername = google && google.displayName;
  let anonymous = 'profile name not found';

  return localUsername || _getFacebookName(user.auth.facebook) || googleUsername || anonymous;
}

schema.pre('validate', function preValidateUser (next) {
  // Populate new user with profile name, not running in pre('save') because the field
  // is required and validation fails if it doesn't exists like for new users
  if (this.isNew && !this.profile.name) {
    this.profile.name = _setProfileName(this);
  }

  next();
});

schema.pre('save', true, function preSaveUser (next, done) {
  next();

  // VERY IMPORTANT NOTE: when only some fields from an user document are selected
  // using `.select('field1 field2')` when the user is saved we must make sure that
  // these hooks do not run using default data. For example if user.items is missing
  // we do not want to run any hook that relies on user.items because it will
  // use the default values defined in the user schema and not the real ones.
  //
  // To check if a field was selected Document.isSelected('field') can be used.
  // more info on its usage can be found at http://mongoosejs.com/docs/api.html#document_Document-isSelected
  // IMPORTANT NOTE2 : due to a bug in mongoose (https://github.com/Automattic/mongoose/issues/5063)
  // document.isSelected('items') will return true even if only a sub field (like 'items.mounts')
  // was selected. So this fix only works as long as the entire subdoc is selected
  // For example in the code below it won't work if only `achievements.beastMasterCount` is selected
  // which is why we should only ever select the full paths and not subdocs,
  // or if we really have to do the document.isSelected() calls should check for
  // every specific subpath (items.mounts, items.pets, ...) but it's better to avoid it
  // since it'll break as soon as a new field is added to the schema but not here.

  // do not calculate achievements if items or achievements are not selected
  if (this.isSelected('items') && this.isSelected('achievements')) {
    // Determines if Beast Master should be awarded
    let beastMasterProgress = shared.count.beastMasterProgress(this.items.pets);

    if (beastMasterProgress >= 90 || this.achievements.beastMasterCount > 0) {
      this.achievements.beastMaster = true;
    }

    // Determines if Mount Master should be awarded
    let mountMasterProgress = shared.count.mountMasterProgress(this.items.mounts);

    if (mountMasterProgress >= 90 || this.achievements.mountMasterCount > 0) {
      this.achievements.mountMaster = true;
    }

    // Determines if Triad Bingo should be awarded
    let dropPetCount = shared.count.dropPetsCurrentlyOwned(this.items.pets);
    let qualifiesForTriad = dropPetCount >= 90 && mountMasterProgress >= 90;

    if (qualifiesForTriad || this.achievements.triadBingoCount > 0) {
      this.achievements.triadBingo = true;
    }

    // EXAMPLE CODE for allowing all existing and new players to be
    // automatically granted an item during a certain time period:
    // if (!this.items.pets['JackOLantern-Base'] && moment().isBefore('2014-11-01'))
    // this.items.pets['JackOLantern-Base'] = 5;
  }

  // Enable weekly recap emails for old users who sign in
  if (this.flags.lastWeeklyRecapDiscriminator) {
    // Enable weekly recap emails in 24 hours
    this.flags.lastWeeklyRecap = moment().subtract(6, 'days').toDate();
    // Unset the field so this is run only once
    this.flags.lastWeeklyRecapDiscriminator = undefined;
  }

  if (_.isNaN(this.preferences.dayStart) || this.preferences.dayStart < 0 || this.preferences.dayStart > 23) {
    this.preferences.dayStart = 0;
  }

  // our own version incrementer
  if (_.isNaN(this._v) || !_.isNumber(this._v)) this._v = 0;
  this._v++;

  // Populate new users with default content
  if (this.isNew) {
    _setUpNewUser(this)
      .then(() => done())
      .catch(done);
  } else {
    done();
  }
});

schema.pre('update', function preUpdateUser () {
  this.update({}, {$inc: {_v: 1}});
});
