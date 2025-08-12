// %mongo server:27017/dbname underscore.js my_commands.js
// %mongo server:27017/dbname underscore.js --shell

// db.users.find({'auth.facebook.email': 'tylerrenelle@gmail.com'}).forEach(function(user){
db.users.find().forEach(function (user) {
  if (!user._id) {
    print('User has null _id');
    return; // need to figure out how to delete these buggers if they don't have an id to delete from
  }

  if (user.idLists) {
    print(`User ${  user._id  } has already been migrated`);
    return;
  }

  if (user._id.indexOf('$') === 0) {
    print(`User id starts with $ (${  user._id  })`);
    return;
  }

  // even though we're clobbering user later, sometimes these are undefined and crash the script
  // this saves us some ternaries
  user.stats = user.stats || {};
  user.items = user.items || {};
  user.preferences = user.preferences || {};
  user.notifications = user.notifications || {};
  user.flags = user.flags || {};
  user.habitIds = user.habitIds || [];
  user.dailyIds = user.dailyIds || [];
  user.todoIds = user.todoIds || [];
  user.rewardIds = user.rewardIds || [];

  _.each(user.tasks, function (task, key) {
    if (!task.type) {
      delete user.tasks[key];
      // idList will take care of itself on page-load
      return;
    }
    if (key === '$spec') {
      print(`$spec was found: ${  user._id}`);
      return;
    }
    if (key.indexOf('$_') === 0) {
      let newKey = key.replace('$_', ''),
        index = user[`${task.type  }Ids`].indexOf(key);
      user[`${task.type  }Ids`][index] = newKey;
      task.id = newKey;
      user.tasks[newKey] = task;
      // TODO make sure this is ok, that we're not deleting the original
      // Otherwise use lodash.cloneDeep
      delete user.tasks[key];
    }
  });

  // New user schema has public and private paths, so we can setup proper access control with racer
  // Note 'public' and 'private' are reserved words
  let newUser = {
    auth: user.auth, // we need this top-level due to derby-auth
    apiToken: user.preferences.api_token || null, // set on update, we need derby.uuid()
    preferences: {
      armorSet: user.preferences.armorSet || 'v1',
      gender: user.preferences.gender || 'm',
    },
    balance: user.balance || 2,
    lastCron: user.lastCron || Number(new Date()),
    history: user.history || [],
    stats: {
      gp: user.stats.money || 0,
      hp: user.stats.hp || 50,
      exp: user.stats.exp || 0,
      lvl: user.stats.lvl || 1,
    },
    items: {
      armor: user.items.armor || 0,
      weapon: user.items.weapon || 0,
    },
    tasks: user.tasks || {},
    idLists: {
      habit: user.habitIds || [],
      daily: user.dailyIds || [],
      todo: user.todoIds || [],
      reward: user.rewardIds || [],
    },
    flags: {
      partyEnabled: false,
      itemsEnabled: user.items.itemsEnabled || false,
      kickstarter: user.notifications.kickstarter || 'show',
      ads: user.flags.ads || null, // null because it's set on registration
    },
    party: {
      current: null,
      invitation: null,
    },
  };

  try {
    db.users.update({_id: user._id}, newUser);
  } catch (e) {
    print(e);
  }
});