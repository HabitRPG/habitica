import _ from 'lodash';
import moment from 'moment';
import common from '../../../common';
import baseModel from '../../libs/baseModel';
import * as Tasks from '../task';
import {
  model as UserNotification,
} from '../userNotification';
import {
  model as PushDevice,
} from '../pushDevice';
import {
  model as Tag,
} from '../tag';
import {
  model as NewsPost,
} from '../newsPost';
import { // eslint-disable-line import/no-cycle
  userActivityWebhook,
} from '../../libs/webhook';
import schema from './schema'; // eslint-disable-line import/no-cycle

schema.plugin(baseModel, {
  // noSet is not used as updating uses a whitelist and creating only accepts
  // specific params (password, email, username, ...)
  noSet: [],
  private: ['auth.local.hashed_password', 'auth.local.passwordHashMethod', 'auth.local.salt', '_cronSignature', '_ABtests', 'secret'],
  toJSONTransform: function userToJSON (plainObj, originalDoc) {
    plainObj._tmp = originalDoc._tmp; // be sure to send down drop notifs

    if (plainObj._tmp && plainObj._tmp.leveledUp) {
      delete plainObj._tmp.leveledUp;
    }

    delete plainObj.filters;

    if (plainObj.flags && originalDoc.isSelected('flags.lastNewStuffRead')) {
      plainObj.flags.newStuff = originalDoc.checkNewStuff();
    }

    if (plainObj.auth && plainObj.auth.local && originalDoc.auth.local.hashed_password) {
      plainObj.auth.local.has_password = true;
    } else if (plainObj.auth && plainObj.auth.local && originalDoc.auth.local.email) {
      plainObj.auth.local.has_password = false;
    }

    return plainObj;
  },
});

function findTag (user, tagName) {
  const tagID = _.find(user.tags, userTag => userTag.name === tagName(user.preferences.language));
  return tagID.id;
}

function _populateDefaultTasks (user, taskTypes) {
  let defaultsData;
  if (user.registeredThrough === 'habitica-android' || user.registeredThrough === 'habitica-ios') {
    defaultsData = common.content.userDefaultsMobile;
  } else {
    defaultsData = common.content.userDefaults;
  }
  const tagsI = taskTypes.indexOf('tag');

  if (tagsI !== -1) {
    user.tags = _.map(defaultsData.tags, tag => {
      const newTag = _.cloneDeep(tag);

      // tasks automatically get _id=helpers.uuid() from TaskSchema id.default,
      // but tags are Schema.Types.Mixed - so we need to manually invoke here
      newTag.id = common.uuid();
      // Render tag's name in user's language
      newTag.name = newTag.name(user.preferences.language);
      return newTag;
    });
  }

  // @TODO: default tasks are handled differently now, and not during registration.
  // We should move this code

  // TODO why isn't this using createTasks from libs/tasksManager?

  const tasksToCreate = [];
  if (user.registeredThrough === 'habitica-web') return Promise.all(tasksToCreate);

  if (tagsI !== -1) {
    taskTypes = _.clone(taskTypes); // eslint-disable-line no-param-reassign
    taskTypes.splice(tagsI, 1);
  }

  _.each(taskTypes, taskType => {
    const tasksOfType = _.map(defaultsData[`${taskType}s`], taskDefaults => {
      const newTask = new Tasks[taskType](taskDefaults);

      newTask.userId = user._id;
      newTask.text = taskDefaults.text(user.preferences.language);
      if (newTask.notes) newTask.notes = taskDefaults.notes(user.preferences.language);
      if (taskDefaults.checklist) {
        newTask.checklist = _.map(taskDefaults.checklist, checklistItem => {
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

  return Promise.all(tasksToCreate)
    .then(tasksCreated => {
      _.each(tasksCreated, task => {
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
    { type: 'potion', path: 'potion' },
    { type: 'armoire', path: 'armoire' },
  );
}

function _setUpNewUser (user) {
  // Mark the last news post as read
  const lastNewsPost = NewsPost.lastNewsPost();
  if (lastNewsPost) {
    user.flags.lastNewStuffRead = lastNewsPost._id;
  }

  let taskTypes;
  const iterableFlags = user.flags.toObject();

  user.items.quests.dustbunnies = 1;
  user.purchased.background.violet = true;
  user.preferences.background = 'violet';
  if (moment().isBefore('2023-03-15T12:00-05:00')) {
    user.migration = '20230314_pi_day';
    user.items.gear.owned.head_special_piDay = true;
    user.items.gear.equipped.head = 'head_special_piDay';
    user.items.gear.owned.shield_special_piDay = true;
    user.items.gear.equipped.shield = 'shield_special_piDay';
    user.items.food.Pie_Skeleton = 1;
    user.items.food.Pie_Base = 1;
    user.items.food.Pie_CottonCandyBlue = 1;
    user.items.food.Pie_CottonCandyPink = 1;
    user.items.food.Pie_Shade = 1;
    user.items.food.Pie_White = 1;
    user.items.food.Pie_Golden = 1;
    user.items.food.Pie_Zombie = 1;
    user.items.food.Pie_Desert = 1;
    user.items.food.Pie_Red = 1;
  }

  user.markModified('items achievements');

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

function _setProfileName (user) {
  const localUsername = user.auth.local && user.auth.local.username;
  const anonymous = 'profile name not found';

  return localUsername || anonymous;
}

schema.post('init', function postInitUser () {
  // Cleanup any corrupt data that could have ended up inside the user schema.
  // In particular:
  // - tags https://github.com/HabitRPG/habitica/issues/10688
  // - notifications https://github.com/HabitRPG/habitica/issues/9923
  // - push devices https://github.com/HabitRPG/habitica/issues/11805
  //            and https://github.com/HabitRPG/habitica/issues/11868

  // Make sure notifications are loaded
  if (this.isDirectSelected('notifications')) {
    this.notifications = UserNotification.cleanupCorruptData(this.notifications);
  }

  // Make sure pushDevices are loaded
  if (this.isDirectSelected('pushDevices')) {
    this.pushDevices = PushDevice.cleanupCorruptData(this.pushDevices);
  }

  // Make sure tags are loaded
  if (this.isDirectSelected('tags')) {
    this.tags = Tag.cleanupCorruptData(this.tags);
  }

  return true;
});

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
  // To check if a field was selected Document.isDirectSelected('field') can be used.
  // more info on its usage can be found at https://mongoosejs.com/docs/api.html#document_Document-isDirectSelected

  // do not calculate achievements if items or achievements are not selected
  if (this.isDirectSelected('items') && this.isDirectSelected('achievements')) {
    // Determines if Beast Master should be awarded
    const beastMasterProgress = common.count.beastMasterProgress(this.items.pets);

    if (
      (beastMasterProgress >= 90 || this.achievements.beastMasterCount > 0)
      && this.achievements.beastMaster !== true
    ) {
      this.achievements.beastMaster = true;
      this.addNotification(
        'ACHIEVEMENT_STABLE',
        {
          achievement: 'beastMaster',
          achievementNotification: 'beastAchievement',
        },
      );
    }

    // Determines if Mount Master should be awarded
    const mountMasterProgress = common.count.mountMasterProgress(this.items.mounts);

    if (
      (mountMasterProgress >= 90 || this.achievements.mountMasterCount > 0)
      && this.achievements.mountMaster !== true
    ) {
      this.achievements.mountMaster = true;
      this.addNotification(
        'ACHIEVEMENT_STABLE',
        {
          achievement: 'mountMaster',
          achievementNotification: 'mountAchievement',
        },
      );
    }

    // Determines if Triad Bingo should be awarded
    const dropPetCount = common.count.dropPetsCurrentlyOwned(this.items.pets);
    const qualifiesForTriad = dropPetCount >= 90 && mountMasterProgress >= 90;

    if (
      (qualifiesForTriad || this.achievements.triadBingoCount > 0)
      && this.achievements.triadBingo !== true
    ) {
      this.achievements.triadBingo = true;
      this.addNotification(
        'ACHIEVEMENT_STABLE',
        {
          achievement: 'triadBingo',
          achievementNotification: 'triadBingoAchievement',
        },
      );
    }

    // EXAMPLE CODE for allowing all existing and new players to be
    // automatically granted an item during a certain time period:
    // if (!this.items.pets['JackOLantern-Base'] && moment().isBefore('2014-11-01'))
    // this.items.pets['JackOLantern-Base'] = 5;
    // this.markModified('items.pets');
  }

  // Filter notifications, remove unvalid and not necessary,
  // handle the ones that have special requirements
  if ( // Make sure all the data is loaded
    this.isDirectSelected('notifications')
    && this.isDirectSelected('stats')
    && this.isDirectSelected('flags')
    && this.isDirectSelected('preferences')
  ) {
    const unallocatedPointsNotifications = [];

    this.notifications = this.notifications.filter(notification => {
      // Remove all unallocated stats points
      if (notification.type === 'UNALLOCATED_STATS_POINTS') {
        unallocatedPointsNotifications.push(notification);
        return false;
      }
      // Keep all the others
      return true;
    });

    // Handle unallocated stats points notifications (keep only one and up to date)
    const pointsToAllocate = this.stats.points;
    const classNotEnabled = !this.flags.classSelected || this.preferences.disableClasses;

    // Take the most recent notification
    const unallLengh = unallocatedPointsNotifications.length;
    const lastExistingNotification = unallocatedPointsNotifications[unallLengh - 1];

    // Decide if it's outdated or not
    const outdatedNotification = !lastExistingNotification
      || lastExistingNotification.data.points !== pointsToAllocate;

    // If there are points to allocate and the notification is outdated, add a new notifications
    if (pointsToAllocate > 0 && !classNotEnabled) {
      if (outdatedNotification) {
        this.addNotification('UNALLOCATED_STATS_POINTS', { points: pointsToAllocate });
      } else { // otherwise add back the last one
        this.notifications.push(lastExistingNotification);
      }
    }
  }

  if (this.isDirectSelected('flags')) {
    // Enable weekly recap emails for old users who sign in
    if (this.flags.lastWeeklyRecapDiscriminator) {
      // Enable weekly recap emails in 24 hours
      this.flags.lastWeeklyRecap = moment().subtract(6, 'days').toDate();
      // Unset the field so this is run only once
      this.flags.lastWeeklyRecapDiscriminator = undefined;
    }
  }

  if (this.isDirectSelected('preferences')) {
    if (
      _.isNaN(this.preferences.dayStart)
      || this.preferences.dayStart < 0
      || this.preferences.dayStart > 23
    ) {
      this.preferences.dayStart = 0;
    }
  }

  // our own version incrementer
  if (this.isDirectSelected('_v')) {
    if (_.isNaN(this._v) || !_.isNumber(this._v)) this._v = 0;
    this._v += 1;
  }

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
  this.update({}, { $inc: { _v: 1 } });
});

schema.pre('updateOne', function preUpdateUser () {
  this.updateOne({}, { $inc: { _v: 1 } });
});
schema.pre('updateMany', function preUpdateUser () {
  this.updateMany({}, { $inc: { _v: 1 } });
});

schema.post('save', function postSaveUser () {
  // Send a webhook notification when the user has leveled up
  if (this._tmp && this._tmp.leveledUp && this._tmp.leveledUp.length > 0) {
    const lvlUpNotifications = this._tmp.leveledUp;
    const firstLvlNotification = lvlUpNotifications[0];
    const lastLvlNotification = lvlUpNotifications[lvlUpNotifications.length - 1];

    const { initialLvl } = firstLvlNotification;
    const finalLvl = lastLvlNotification.newLvl;

    userActivityWebhook.send(this, {
      type: 'leveledUp',
      initialLvl,
      finalLvl,
    });

    this._tmp.leveledUp = [];
  }
});
