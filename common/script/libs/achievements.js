import i18n from '../i18n';

let achievs = {};
let index;

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

function _addQuest (result, user, data) {
  let value;

  if (user.achievements.quests) {
    value = user.achievements.quests[data.path];
  }

  _add(result, {
    title: i18n.t(data.title, data.language),
    text: i18n.t(data.text, data.language),
    icon: data.icon,
    key: `${data.path}Quest`,
    value,
    earned: Boolean(value),
  });
}

function _addSimple (result, user, data) {
  let value = user.achievements[data.path];

  _add(result, {
    title: i18n.t(data.title, data.language),
    text: i18n.t(data.text, data.language),
    icon: data.icon,
    key: data.key || data.path,
    value: data.value,
    earned: Boolean(value),
  });
}

function _addSimpleWithMasterCount (result, user, data) {
  let language = data.language;
  let value = user.achievements[`${data.path}Count`];
  if (!value) {
    value = 0;
  }

  let text = i18n.t(`${data.path}Text`, language);
  if (value > 0) {
    text += i18n.t(`${data.path}Text2`, {count: value}, language);
  }

  _add(result, {
    title: i18n.t(`${data.path}Name`, language),
    text,
    icon: data.icon,
    key: data.path,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addSimpleWithCount (result, user, data) {
  let value = user.achievements[data.path];
  if (!value) {
    value = 0;
  }

  if (!data.labels) {
    data.labels = {
      title: `${data.path}Name`,
      text: `${data.path}Text`,
    };
  }

  _add(result, {
    title: i18n.t(data.labels.title, data.language),
    text: i18n.t(data.labels.text, {count: value}, data.language),
    icon: data.icon,
    key: data.key || data.path,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addPlural (result, user, data) {
  if (!data.altPath) {
    data.altPath = data.path;
  }

  let value = user.achievements[data.altPath];
  if (!value) {
    value = 0;
  }

  if (!data.labels) {
    data.labels = {
      singularTitle: `${data.path}Singular`,
      singularText: `${data.path}SingularText`,

      pluralTitle: `${data.path}Name`,
      pluralText: `${data.path}Text`,
    };
  }

  // value === 0, labels.singularTitle, labels.singularText
  // value !== 0, labels.pluralTitle, labels.pluralText

  let title = i18n.t(value === 0 ? data.labels.singularTitle : data.labels.pluralTitle, {count: value}, data.language);
  let text = i18n.t(value === 0 ? data.labels.singularText : data.labels.pluralText, {count: value}, data.language);

  _add(result, {
    title,
    text,
    icon: data.icon,
    key: data.key || data.path,
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

  let localizedClass = i18n.t(data.path, data.language);

  let title = i18n.t('ultimGearName', {ultClass: localizedClass}, data.language);
  let text = i18n.t('ultimGearText', {ultClass: localizedClass}, data.language);

  _add(result, {
    title,
    text,
    icon: data.icon,
    key: `${data.path}UltimateGear`,
    value,
    earned: Boolean(value),
  });
}

function _getBasicAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {
    path: 'streak',
    icon: 'achievement-thermometer',
    language,
  });

  _addPlural(result, user, {
    path: 'perfect',
    icon: 'achievement-perfect',
    language,
  });

  _addSimple(result, user, {
    path: 'partyUp',
    icon: 'achievement-partyUp',
    title: 'partyUpName',
    text: 'partyUpText',
    language,
  });

  _addSimple(result, user, {
    path: 'partyOn',
    icon: 'achievement-partyOn',
    title: 'partyOnName',
    text: 'partyOnText',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    path: 'beastMaster',
    icon: 'achievement-rat',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    path: 'mountMaster',
    icon: 'achievement-wolf',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    path: 'triadBingo',
    icon: 'achievement-triadbingo',
    language,
  });

  _addUltimateGear(result, user, {
    path: 'healer',
    icon: 'achievement-ultimate-healer',
    language,
  });

  _addUltimateGear(result, user, {
    path: 'rogue',
    icon: 'achievement-ultimate-rogue',
    language,
  });

  _addUltimateGear(result, user, {
    path: 'warrior',
    icon: 'achievement-ultimate-warrior',
    language,
  });

  _addUltimateGear(result, user, {
    path: 'mage',
    icon: 'achievement-ultimate-mage',
    altpath: 'wizard',
    language,
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
  });

  return result;
}

function _getSeasonalAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {
    path: 'habiticaDays',
    icon: 'achievement-habiticaDay',
    labels: {
      singularTitle: 'habiticaDay',
      singularText: 'habiticaDaySingularText',
      pluralTitle: 'habiticaDay',
      pluralText: 'habiticaDayPluralText',
    },
    language,
  });

  _addPlural(result, user, {
    path: 'habitBirthdays',
    icon: 'achievement-habitBirthday',
    labels: {
      singularTitle: 'habitBirthday',
      singularText: 'habitBirthdayText',
      pluralTitle: 'habitBirthday',
      pluralText: 'habitBirthdayPluralText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    path: 'snowball',
    icon: 'achievement-snowball',
    labels: {
      title: 'annoyingFriends',
      text: 'annoyingFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    path: 'spookySparkles',
    icon: 'achievement-spookySparkles',
    labels: {
      title: 'alarmingFriends',
      text: 'alarmingFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    path: 'shinySeed',
    icon: 'achievement-shinySeed',
    labels: {
      title: 'agriculturalFriends',
      text: 'agriculturalFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    path: 'seafoam',
    icon: 'achievement-seafoam',
    labels: {
      title: 'aquaticFriends',
      text: 'aquaticFriendsText',
    },
    language,
  });

  _addQuest(result, user, {
    path: 'dilatory',
    icon: 'achievement-dilatory',
    title: 'achievementDilatory',
    text: 'achievementDilatoryText',
    language,
  });

  _addQuest(result, user, {
    path: 'stressbeast',
    icon: 'achievement-stoikalm',
    title: 'achievementStressbeast',
    text: 'achievementStressbeastText',
    language,
  });

  _addQuest(result, user, {
    path: 'burnout',
    icon: 'achievement-burnout',
    title: 'achievementBurnout',
    text: 'achievementBurnoutText',
    language,
  });

  _addQuest(result, user, {
    path: 'bewilder',
    icon: 'achievement-bewilder',
    title: 'achievementBewilder',
    text: 'achievementBewilderText',
    language,
  });

  _addPlural(result, user, {
    path: 'costumeContests',
    icon: 'achievement-costumeContest',
    labels: {
      singularTitle: 'costumeContest',
      singularText: 'costumeContestText',
      pluralTitle: 'costumeContest',
      pluralText: 'costumeContestTextPlural',
    },
    language,
  });

  let cardAchievements = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday'];

  cardAchievements.forEach(path => {
    _addSimpleWithCount(result, user, {
      path,
      key: `${path}Cards`,
      icon: `achievement-${path}`,
      labels: {
        title: `${path}CardAchievementTitle`,
        text: `${path}CardAchievementText`,
      },
      language,
    });
  });

  return result;
}

function _getSpecialAchievements (user, language) {
  let result = {};

  _addPlural(result, user, {
    path: 'habitSurveys',
    icon: 'achievement-tree',
    labels: {
      singularTitle: 'helped',
      singularText: 'surveysSingle',
      pluralTitle: 'helped',
      pluralText: 'surveysMultiple',
    },
    language,
  });

  let contributorAchiev = {
    key: 'contributor',
    icon: 'achievement-boot',
    text: i18n.t('contribText', language),
  };
  if (user.contributor && user.contributor.level) {
    contributorAchiev.value = user.contributor.level;
    contributorAchiev.earned = true;
    contributorAchiev.title = contribText(user.contributor, user.backer, language);
  } else {
    contributorAchiev.value = 0;
    contributorAchiev.earned = false;
    contributorAchiev.title = i18n.t('contribName', language);
  }
  _add(result, contributorAchiev);

  if (user.backer && user.backer.npc) {
    _add(result, {
      title: user.backer.npc + i18n.t('npc', language),
      text: i18n.t('npcAchievementText', language),
      icon: 'achievement-ultimate-warrior',
      key: 'npc',
      value: user.backer.npc,
      earned: true,
    });
  }

  if (user.backer && user.backer.tier) {
    _add(result, {
      title: i18n.t('kickstartName', {tier: user.backer.tier}, language),
      text: i18n.t('kickstartText', language),
      icon: 'achievement-heart',
      key: 'kickstarter',
      value: user.backer.tier,
      earned: true,
    });
  }

  if (user.achievements.veteran) {
    _add(result, {
      title: i18n.t('veteran', language),
      text: i18n.t('veteranText', language),
      icon: 'achievement-cake',
      key: 'veteran',
      value: user.achievements.veteran,
      earned: true,
    });
  }

  if (user.achievements.originalUser) {
    _add(result, {
      title: i18n.t('originalUser', language),
      text: i18n.t('originalUserText', language),
      icon: 'achievement-alpha',
      key: 'originalUser',
      value: user.achievements.originalUser,
      earned: true,
    });
  }

  return result;
}

// Build and return the given user's achievement data.
achievs.getAchievementsForProfile = function getAchievementsForProfile (user, language) {
  index = 0;
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
