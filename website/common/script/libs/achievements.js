import content from '../content/index';
import i18n from '../i18n';
import get from 'lodash/get';

let achievs = {};
let achievsContent = content.achievements;
let index = 0;

function contribText (contrib, backer, language) {
  if (!contrib && !backer) return;
  if (backer && backer.npc) return backer.npc;
  let lvl = contrib && contrib.level;
  if (lvl && lvl > 0) {
    let contribTitle = '';

    if (lvl < 3) {
      contribTitle = i18n.t('friend', language);
    } else if (lvl < 5) {
      contribTitle = i18n.t('elite', language);
    } else if (lvl < 7) {
      contribTitle = i18n.t('champion', language);
    } else if (lvl < 8) {
      contribTitle = i18n.t('legendary', language);
    } else if (lvl < 9) {
      contribTitle = i18n.t('guardian', language);
    } else {
      contribTitle = i18n.t('heroic', language);
    }

    return `${contribTitle} ${contrib.text}`;
  }
}

function _add (result, data) {
  result[data.key] = {
    title: data.title,
    text: data.text,
    icon: data.icon,
    earned: data.earned,
    value: data.value,
    index: index++,
    optionalCount: data.optionalCount,
  };
}

function _addSimpleWithCustomPath (result, user, data) {
  let value = get(user, data.path);
  let thisContent = achievsContent[data.key];

  _add(result, {
    title: i18n.t(thisContent.titleKey, {key: value}, data.language),
    text: i18n.t(thisContent.textKey, data.language),
    icon: thisContent.icon,
    key: data.key,
    value,
    earned: Boolean(value),
  });
}

function _addQuest (result, user, data) {
  data.key = `${data.path}Quest`;
  data.path = `achievements.quests.${data.path}`;
  _addSimpleWithCustomPath(result, user, data);
}

function _addSimple (result, user, data) {
  let value = user.achievements[data.path];

  let key = data.key || data.path;
  let thisContent = achievsContent[key];

  _add(result, {
    title: i18n.t(thisContent.titleKey, data.language),
    text: i18n.t(thisContent.textKey, data.language),
    icon: thisContent.icon,
    key,
    value,
    earned: Boolean(value),
  });
}

function _addSimpleWithMasterCount (result, user, data) {
  let language = data.language;
  let value = user.achievements[`${data.path}Count`] || 0;

  let thisContent = achievsContent[data.path];

  let text = i18n.t(thisContent.textKey, language);
  if (value > 0) {
    text += i18n.t(thisContent.text2Key, {count: value}, language);
  }

  _add(result, {
    title: i18n.t(thisContent.titleKey, language),
    text,
    icon: thisContent.icon,
    key: data.path,
    value,
    optionalCount: value,
    earned: user.achievements[data.path] || false,
  });
}

function _addSimpleWithCount (result, user, data) {
  let value = user.achievements[data.path] || 0;

  let key = data.key || data.path;
  let thisContent = achievsContent[key];

  _add(result, {
    title: i18n.t(thisContent.titleKey, data.language),
    text: i18n.t(thisContent.textKey, {count: value}, data.language),
    icon: thisContent.icon,
    key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addPlural (result, user, data) {
  let value = user.achievements[data.path] || 0;

  let key = data.key || data.path;
  let thisContent = achievsContent[key];

  let titleKey;
  let textKey;
  // If value === 1, use singular versions of strings.
  // If value !== 1, use plural versions of strings.
  if (value === 1) {
    titleKey = thisContent.singularTitleKey;
    textKey = thisContent.singularTextKey;
  } else {
    titleKey = thisContent.pluralTitleKey;
    textKey = thisContent.pluralTextKey;
  }

  _add(result, {
    title: i18n.t(titleKey, {count: value}, data.language),
    text: i18n.t(textKey, {count: value}, data.language),
    icon: thisContent.icon,
    key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addUltimateGear (result, user, data) {
  if (!data.altPath) {
    data.altPath = data.path;
  }

  let value = user.achievements.ultimateGearSets[data.altPath];

  let key = `${data.path}UltimateGear`;
  let thisContent = achievsContent[key];

  let localizedClass = i18n.t(data.path, data.language);
  let title = i18n.t(thisContent.titleKey, {ultClass: localizedClass}, data.language);
  let text = i18n.t(thisContent.textKey, {ultClass: localizedClass}, data.language);

  _add(result, {
    title,
    text,
    icon: thisContent.icon,
    key,
    value,
    earned: Boolean(value),
  });
}

function _getBasicAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {path: 'streak', language});
  _addPlural(result, user, {path: 'perfect', language});

  _addSimple(result, user, {path: 'partyUp', language});
  _addSimple(result, user, {path: 'partyOn', language});
  _addSimple(result, user, {path: 'joinedGuild', language});
  _addSimple(result, user, {path: 'royallyLoyal', language});
  _addSimple(result, user, {path: 'joinedChallenge', language});
  _addSimple(result, user, {path: 'invitedFriend', language});
  _addSimple(result, user, {path: 'lostMasterclasser', language});

  _addSimpleWithMasterCount(result, user, {path: 'beastMaster', language});
  _addSimpleWithMasterCount(result, user, {path: 'mountMaster', language});
  _addSimpleWithMasterCount(result, user, {path: 'triadBingo', language});

  _addUltimateGear(result, user, {path: 'healer', language});
  _addUltimateGear(result, user, {path: 'rogue', language});
  _addUltimateGear(result, user, {path: 'warrior', language});
  _addUltimateGear(result, user, {path: 'mage', altPath: 'wizard', language});

  let cardAchievements = ['greeting', 'thankyou', 'birthday', 'congrats', 'getwell', 'goodluck'];
  cardAchievements.forEach(path => {
    _addSimpleWithCount(result, user, {path, key: `${path}Cards`, language});
  });

  let rebirthTitle;
  let rebirthText;

  if (user.achievements.rebirths > 1) {
    rebirthTitle = i18n.t('rebirthText', {rebirths: user.achievements.rebirths}, language);
  } else {
    rebirthTitle = i18n.t('rebirthBegan', language);
  }

  if (!user.achievements.rebirthLevel) {
    rebirthText = i18n.t('rebirthOrbNoLevel', language);
  } else if (user.achievements.rebirthLevel < 100) {
    rebirthText = i18n.t('rebirthOrb', {level: user.achievements.rebirthLevel}, language);
  } else {
    rebirthText = i18n.t('rebirthOrb100', language);
  }

  _add(result, {
    key: 'rebirth',
    title: rebirthTitle,
    text: rebirthText,
    icon: 'achievement-sun',
    earned: Boolean(user.achievements.rebirths),
    optionalCount: user.achievements.rebirths,
  });

  return result;
}

function _getSeasonalAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {path: 'habiticaDays', language});
  _addPlural(result, user, {path: 'habitBirthdays', language});

  let spellAchievements = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];
  spellAchievements.forEach(path => {
    _addSimpleWithCount(result, user, {path, language});
  });

  let questAchievements = ['dilatory', 'stressbeast', 'burnout', 'bewilder'];
  questAchievements.forEach(path => {
    if (user.achievements.quests[path]) {
      _addQuest(result, user, {path, language});
    }
  });

  _addPlural(result, user, {path: 'costumeContests', language});

  let cardAchievements = ['nye', 'valentine'];
  cardAchievements.forEach(path => {
    _addSimpleWithCount(result, user, {path, key: `${path}Cards`, language});
  });

  return result;
}

function _getSpecialAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {path: 'habitSurveys', language});

  let contribKey = 'contributor';
  let contribContent = achievsContent[contribKey];
  let contributorAchiev = {
    key: contribKey,
    text: i18n.t(contribContent.textKey, language),
    icon: contribContent.icon,
    earned: Boolean(user.contributor && user.contributor.level),
  };
  if (user.contributor && user.contributor.level) {
    contributorAchiev.value = user.contributor.level;
    contributorAchiev.title = contribText(user.contributor, user.backer, language);
  } else {
    contributorAchiev.value = 0;
    contributorAchiev.title = i18n.t(contribContent.titleKey, language);
  }
  _add(result, contributorAchiev);

  if (user.backer && user.backer.npc) {
    _addSimpleWithCustomPath(result, user, {key: 'npc', path: 'backer.npc', language});
  }

  if (user.backer && user.backer.tier) {
    _addSimpleWithCustomPath(result, user, {key: 'kickstarter', path: 'backer.tier', language});
  }

  if (user.achievements.veteran) {
    _addSimple(result, user, {path: 'veteran', language});
  }

  if (user.achievements.originalUser) {
    _addSimple(result, user, {path: 'originalUser', language});
  }

  return result;
}

// Build and return the given user's achievement data.
achievs.getAchievementsForProfile = function getAchievementsForProfile (user, language) {
  let result = {
    basic: {
      label: 'Basic',
      achievements: _getBasicAchievements(user, language),
    },
    seasonal: {
      label: 'Seasonal',
      achievements: _getSeasonalAchievements(user, language),
    },
    special: {
      label: 'Special',
      achievements: _getSpecialAchievements(user, language),
    },
  };
  return result;
};

module.exports = achievs;
