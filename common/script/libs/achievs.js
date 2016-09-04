import _ from 'lodash';
import i18n from '../i18n';

let achievs = {};

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

function _addQuest (result, user, data) {
  let value;

  if (user.achievements.quests) {
    value = user.achievements.quests[data.key];
  }

  result.push({
    title: i18n.t(data.title, data.language),
    text: i18n.t(data.text, data.language),
    icon: data.icon,
    category: data.category,
    key: data.key,
    value,
    earned: Boolean(value),
  });
}

function _addSimple (result, user, data) {
  let value = user.achievements[data.key];

  result.push({
    title: i18n.t(data.title, data.language),
    text: i18n.t(data.text, data.language),
    icon: data.icon,
    category: data.category,
    key: data.key,
    value: data.value,
    earned: Boolean(value),
  });
}

function _addSimpleWithMasterCount (result, user, data) {
  let language = data.language;
  let value = user.achievements[`${data.key}Count`];

  let text = i18n.t(`${data.key}Text`, language);
  if (value === 0) {
    text += i18n.t(`${data.key}Text2`, {count: value}, language);
  }

  result.push({
    title: i18n.t(`${data.key}Name`, language),
    text,
    icon: data.icon,
    category: data.category,
    key: data.key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addSimpleWithCount (result, user, data) {
  let value = user.achievements[data.key];

  if (!data.labels) {
    data.labels = {
      title: `${data.key}Name`,
      text: `${data.key}Text`,
    };
  }

  if (!value) {
    value = 0;
  }

  result.push({
    title: i18n.t(data.labels.title, data.language),
    text: i18n.t(data.labels.text, {count: value}, data.language),
    icon: data.icon,
    category: data.category,
    key: data.key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addPlural (result, user, data) {
  if (!data.altKey) {
    data.altKey = data.key;
  }

  let value = user.achievements[data.altKey];

  if (!data.labels) {
    data.labels = {
      singularTitle: `${data.key}Singular`,
      singularText: `${data.key}SingularText`,

      pluralTitle: `${data.key}Name`,
      pluralText: `${data.key}Text`,
    };
  }

  // value === 0, labels.singularTitle, labels.singularText
  // value !== 0, labels.pluralTitle, labels.pluralText

  let title = i18n.t(value === 0 ? data.labels.singularTitle : data.labels.pluralTitle, {count: value}, data.language);
  let text = i18n.t(value === 0 ? data.labels.singularText : data.labels.pluralText, {count: value}, data.language);

  result.push({
    title,
    text,
    icon: data.icon,
    category: data.category,
    key: data.key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addUltimateGear (result, user, data) {
  if (!data.altKey) {
    data.altKey = data.key;
  }

  let value = user.achievements.ultimateGearSets[data.altKey];

  let title = i18n.t('ultimGearName', {ultClass: i18n.t(data.key, data.language)}, data.language);
  let text = i18n.t(`${data.key}UltimGearText`, data.language);

  result.push({
    title,
    text,
    icon: data.icon,
    category: data.category,
    key: `ultimateGear${data.key}`,
    value,
    earned: Boolean(value),
  });
}

achievs.getBasicAchievements = function getBasicAchievements (user, language) {
  let result = [];

  _addPlural(result, user, {
    key: 'streak',
    icon: 'achievement-thermometer',
    category: 'Basic',
    language,
  });

  _addPlural(result, user, {
    key: 'perfect',
    icon: 'achievement-perfect',
    category: 'Basic',
    language,
  });

  _addSimple(result, user, {
    key: 'partyUp',
    icon: 'achievement-partyUp',
    title: 'partyUpName',
    text: 'partyUpText',
    category: 'Basic',
    language,
  });

  _addSimple(result, user, {
    key: 'partyOn',
    icon: 'achievement-partyOn',
    title: 'partyOnName',
    text: 'partyOnText',
    category: 'Basic',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    key: 'beastMaster',
    icon: 'achievement-rat',
    category: 'Basic',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    key: 'mountMaster',
    icon: 'achievement-wolf',
    category: 'Basic',
    language,
  });

  _addSimpleWithMasterCount(result, user, {
    key: 'triadBingo',
    icon: 'achievement-triadbingo',
    category: 'Basic',
    language,
  });

  _addUltimateGear(result, user, {
    key: 'healer',
    icon: 'achievement-ultimate-healer',
    category: 'Basic',
    language,
  });

  _addUltimateGear(result, user, {
    key: 'rogue',
    icon: 'achievement-ultimate-rogue',
    category: 'Basic',
    language,
  });

  _addUltimateGear(result, user, {
    key: 'warrior',
    icon: 'achievement-ultimate-warrior',
    category: 'Basic',
    language,
  });

  _addUltimateGear(result, user, {
    key: 'mage',
    icon: 'achievement-ultimate-mage',
    category: 'Basic',
    altKey: 'wizard',
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

  result.push({
    title: rebirthTitle,
    text: rebirthText,
    icon: 'achievement-sun',
    category: 'Basic',
    key: 'rebirth',
    earned: Boolean(user.achievements.rebirths),
  });

  return result;
};

achievs.getSeasonalAchievements = function getSeasonalAchievements (user, language) {
  let result = [];

  _addPlural(result, user, {
    key: 'habiticaDays',
    icon: 'achievement-habiticaDay',
    category: 'Seasonal',
    labels: {
      singularTitle: 'habiticaDay',
      singularText: 'habiticaDaySingularText',
      pluralTitle: 'habiticaDay',
      pluralText: 'habiticaDayPluralText',
    },
    language,
  });

  _addPlural(result, user, {
    key: 'habitBirthdays',
    icon: 'achievement-habitBirthday',
    category: 'Seasonal',
    labels: {
      singularTitle: 'habitBirthday',
      singularText: 'habitBirthdayText',
      pluralTitle: 'habitBirthday',
      pluralText: 'habitBirthdayPluralText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    key: 'snowball',
    icon: 'achievement-snowball',
    category: 'Seasonal',
    labels: {
      title: 'annoyingFriends',
      text: 'annoyingFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    key: 'spookySparkles',
    icon: 'achievement-spookySparkles',
    category: 'Seasonal',
    labels: {
      title: 'alarmingFriends',
      text: 'alarmingFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    key: 'shinySeed',
    icon: 'achievement-shinySeed',
    category: 'Seasonal',
    labels: {
      title: 'agriculturalFriends',
      text: 'agriculturalFriendsText',
    },
    language,
  });

  _addSimpleWithCount(result, user, {
    key: 'seafoam',
    icon: 'achievement-seafoam',
    category: 'Seasonal',
    labels: {
      title: 'aquaticFriends',
      text: 'aquaticFriendsText',
    },
    language,
  });

  _addQuest(result, user, {
    key: 'dilatory',
    icon: 'achievement-dilatory',
    category: 'Seasonal',
    title: 'achievementDilatory',
    text: 'achievementDilatoryText',
    language,
  });

  _addQuest(result, user, {
    key: 'stressbeast',
    icon: 'achievement-stoikalm',
    category: 'Seasonal',
    title: 'achievementStressbeast',
    text: 'achievementStressbeastText',
    language,
  });

  _addQuest(result, user, {
    key: 'burnout',
    icon: 'achievement-burnout',
    category: 'Seasonal',
    title: 'achievementBurnout',
    text: 'achievementBurnoutText',
    language,
  });

  _addQuest(result, user, {
    key: 'bewilder',
    icon: 'achievement-bewilder',
    category: 'Seasonal',
    title: 'achievementBewilder',
    text: 'achievementBewilderText',
    language,
  });

  _addPlural(result, user, {
    key: 'costumeContests',
    icon: 'achievement-costumeContest',
    category: 'Seasonal',
    labels: {
      singularTitle: 'costumeContest',
      singularText: 'costumeContestText',
      pluralTitle: 'costumeContest',
      pluralText: 'costumeContestTextPlural',
    },
    language,
  });

  let cardAchievements = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday'];

  cardAchievements.forEach(key => {
    _addSimpleWithCount(result, user, {
      key,
      icon: `achievement-${key}`,
      category: 'Seasonal',
      labels: {
        title: `${key}CardAchievementTitle`,
        text: `${key}CardAchievementText`,
      },
      language,
    });
  });

  return result;
};

achievs.getSpecialAchievements = function getSpecialAchievements (user, language) {
  let result = [];

  _addPlural(result, user, {
    key: 'habitSurveys',
    icon: 'achievement-tree',
    category: 'Special',
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
    category: 'Special',
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
  result.push(contributorAchiev);

  if (user.backer && user.backer.npc) {
    result.push({
      title: user.backer.npc + i18n.t('npc', language),
      text: i18n.t('npcText', language),
      icon: 'achievement-ultimate-warrior',
      category: 'Special',
      key: 'npc',
      value: user.backer.npc,
      earned: true,
    });
  }

  if (user.backer && user.backer.tier) {
    result.push({
      title: i18n.t('kickstartName', {tier: user.backer.tier}, language),
      text: i18n.t('kickstartText', language),
      icon: 'achievement-heart',
      category: 'Special',
      key: 'tier',
      value: user.backer.tier,
      earned: true,
    });
  }

  if (user.achievements.veteran) {
    result.push({
      title: i18n.t('veteran', language),
      text: i18n.t('veteranText', language),
      icon: 'achievement-cake',
      category: 'Special',
      key: 'veteran',
      value: user.achievements.veteran,
      earned: true,
    });
  }

  if (user.achievements.originalUser) {
    result.push({
      title: i18n.t('originalUser', language),
      text: i18n.t('originalUserText', language),
      icon: 'achievement-alpha',
      category: 'Special',
      key: 'originalUser',
      value: user.achievements.originalUser,
      earned: true,
    });
  }

  return result;
};

// Build and return the given user's achievement data.
achievs.getAchievementsForProfile = function getAchievementsForProfile (user, language) {
  let result = achievs.getBasicAchievements(user, language);
  result = _.concat(result, achievs.getSeasonalAchievements(user, language));
  result = _.concat(result, achievs.getSpecialAchievements(user, language));

  return result;
};

module.exports = achievs;
