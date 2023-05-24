import get from 'lodash/get';
import content from '../content/index';
import i18n from '../i18n';

const achievs = {};
const achievsContent = content.achievements;
let index = 0;

function contribText (contrib, backer, language) {
  if (!contrib && !backer) return null;
  if (backer && backer.npc) return backer.npc;

  const lvl = contrib && contrib.level;
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

  return null;
}

function _add (result, data) {
  result[data.key] = {
    title: data.title,
    text: data.text,
    icon: data.icon,
    earned: data.earned,
    value: data.value,
    index: index += 1,
    optionalCount: data.optionalCount,
  };
}

function _addSimpleWithCustomPath (result, user, data) {
  const value = get(user, data.path);
  const thisContent = achievsContent[data.key];

  _add(result, {
    title: i18n.t(thisContent.titleKey, { key: value }, data.language),
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
  const value = user.achievements[data.path];

  const key = data.key || data.path;
  const thisContent = achievsContent[key];

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
  const { language } = data;
  const value = user.achievements[`${data.path}Count`] || 0;

  const thisContent = achievsContent[data.path];

  let text = i18n.t(thisContent.textKey, language);
  if (value > 0) {
    text += i18n.t(thisContent.text2Key, { count: value }, language);
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
  const value = user.achievements[data.path] || 0;

  const key = data.key || data.path;
  const thisContent = achievsContent[key];

  _add(result, {
    title: i18n.t(thisContent.titleKey, data.language),
    text: i18n.t(thisContent.textKey, { count: value }, data.language),
    icon: thisContent.icon,
    key,
    value,
    optionalCount: value,
    earned: Boolean(value),
  });
}

function _addPlural (result, user, data) {
  const value = user.achievements[data.path] || 0;

  const key = data.key || data.path;
  const thisContent = achievsContent[key];

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
    title: i18n.t(titleKey, { count: value }, data.language),
    text: i18n.t(textKey, { count: value }, data.language),
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

  const value = user.achievements.ultimateGearSets[data.altPath];

  const key = `${data.path}UltimateGear`;
  const thisContent = achievsContent[key];

  const localizedClass = i18n.t(data.path, data.language);
  const title = i18n.t(thisContent.titleKey, { ultClass: localizedClass }, data.language);
  const text = i18n.t(thisContent.textKey, { ultClass: localizedClass }, data.language);

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
  const result = {};

  _addPlural(result, user, { path: 'streak', language });
  _addPlural(result, user, { path: 'perfect', language });

  _addSimple(result, user, { path: 'partyUp', language });
  _addSimple(result, user, { path: 'partyOn', language });
  _addSimple(result, user, { path: 'royallyLoyal', language });
  _addSimple(result, user, { path: 'joinedChallenge', language });
  _addSimple(result, user, { path: 'invitedFriend', language });
  _addSimple(result, user, { path: 'lostMasterclasser', language });
  _addSimple(result, user, { path: 'mindOverMatter', language });
  _addSimple(result, user, { path: 'justAddWater', language });
  _addSimple(result, user, { path: 'backToBasics', language });
  _addSimple(result, user, { path: 'allYourBase', language });
  _addSimple(result, user, { path: 'dustDevil', language });
  _addSimple(result, user, { path: 'aridAuthority', language });
  _addSimple(result, user, { path: 'monsterMagus', language });
  _addSimple(result, user, { path: 'undeadUndertaker', language });
  _addSimple(result, user, { path: 'primedForPainting', language });
  _addSimple(result, user, { path: 'pearlyPro', language });
  _addSimple(result, user, { path: 'tickledPink', language });
  _addSimple(result, user, { path: 'rosyOutlook', language });
  _addSimple(result, user, { path: 'bugBonanza', language });
  _addSimple(result, user, { path: 'bareNecessities', language });
  _addSimple(result, user, { path: 'freshwaterFriends', language });
  _addSimple(result, user, { path: 'goodAsGold', language });
  _addSimple(result, user, { path: 'allThatGlitters', language });
  _addSimple(result, user, { path: 'boneCollector', language });
  _addSimple(result, user, { path: 'skeletonCrew', language });
  _addSimple(result, user, { path: 'seeingRed', language });
  _addSimple(result, user, { path: 'redLetterDay', language });
  _addSimple(result, user, { path: 'legendaryBestiary', language });
  _addSimple(result, user, { path: 'seasonalSpecialist', language });
  _addSimple(result, user, { path: 'violetsAreBlue', language });
  _addSimple(result, user, { path: 'wildBlueYonder', language });
  _addSimple(result, user, { path: 'domesticated', language });
  _addSimple(result, user, { path: 'shadyCustomer', language });
  _addSimple(result, user, { path: 'shadeOfItAll', language });
  _addSimple(result, user, { path: 'zodiacZookeeper', language });
  _addSimple(result, user, { path: 'birdsOfAFeather', language });
  _addSimple(result, user, { path: 'reptacularRumble', language });
  _addSimple(result, user, { path: 'woodlandWizard', language });
  _addSimple(result, user, { path: 'boneToPick', language });
  _addSimple(result, user, { path: 'polarPro', language });
  _addSimple(result, user, { path: 'plantParent', language });
  _addSimple(result, user, { path: 'dinosaurDynasty', language });

  _addSimpleWithMasterCount(result, user, { path: 'beastMaster', language });
  _addSimpleWithMasterCount(result, user, { path: 'mountMaster', language });
  _addSimpleWithMasterCount(result, user, { path: 'triadBingo', language });

  _addUltimateGear(result, user, { path: 'healer', language });
  _addUltimateGear(result, user, { path: 'rogue', language });
  _addUltimateGear(result, user, { path: 'warrior', language });
  _addUltimateGear(result, user, { path: 'mage', altPath: 'wizard', language });

  const cardAchievements = ['greeting', 'thankyou', 'birthday', 'congrats', 'getwell', 'goodluck'];
  cardAchievements.forEach(path => {
    _addSimpleWithCount(result, user, { path, key: `${path}Cards`, language });
  });

  let rebirthTitle;
  let rebirthText;

  if (user.achievements.rebirths > 1) {
    rebirthTitle = i18n.t('rebirthText', { rebirths: user.achievements.rebirths }, language);
  } else {
    rebirthTitle = i18n.t('rebirthBegan', language);
  }

  if (!user.achievements.rebirthLevel) {
    rebirthText = i18n.t('rebirthOrbNoLevel', language);
  } else if (user.achievements.rebirthLevel < 100) {
    rebirthText = i18n.t('rebirthOrb', { level: user.achievements.rebirthLevel }, language);
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

function _getOnboardingAchievements (user, language) {
  const result = {};

  _addSimple(result, user, { path: 'createdTask', language });
  _addSimple(result, user, { path: 'completedTask', language });
  _addSimple(result, user, { path: 'hatchedPet', language });
  _addSimple(result, user, { path: 'fedPet', language });
  _addSimple(result, user, { path: 'purchasedEquipment', language });

  return result;
}

function _getSeasonalAchievements (user, language) {
  const result = {};

  _addPlural(result, user, { path: 'habiticaDays', language });
  _addPlural(result, user, { path: 'habitBirthdays', language });

  const spellAchievements = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];
  spellAchievements.forEach(path => {
    _addSimpleWithCount(result, user, { path, language });
  });

  const questAchievements = ['dilatory', 'stressbeast', 'burnout', 'bewilder', 'dysheartener'];
  questAchievements.forEach(path => {
    if (user.achievements.quests[path]) {
      _addQuest(result, user, { path, language });
    }
  });

  _addPlural(result, user, { path: 'costumeContests', language });

  const cardAchievements = ['nye', 'valentine'];
  cardAchievements.forEach(path => {
    _addSimpleWithCount(result, user, { path, key: `${path}Cards`, language });
  });

  return result;
}

function _getSpecialAchievements (user, language) {
  const result = {};

  _addPlural(result, user, { path: 'habitSurveys', language });

  const contribKey = 'contributor';
  const contribContent = achievsContent[contribKey];
  const contributorAchiev = {
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
    _addSimpleWithCustomPath(result, user, { key: 'npc', path: 'backer.npc', language });
  }

  if (user.backer && user.backer.tier) {
    _addSimpleWithCustomPath(result, user, { key: 'kickstarter', path: 'backer.tier', language });
  }

  if (user.achievements.veteran) {
    _addSimple(result, user, { path: 'veteran', language });
  }

  if (user.achievements.originalUser) {
    _addSimple(result, user, { path: 'originalUser', language });
  }

  if (user.achievements.kickstarter2019) {
    _addSimple(result, user, { path: 'kickstarter2019', language });
  }

  if (user.achievements.groupsBeta2022) {
    _addSimple(result, user, { path: 'groupsBeta2022', language });
  }

  if (user.achievements.joinedGuild) {
    _addSimple(result, user, { path: 'joinedGuild', language });
  }

  return result;
}

// Build and return the given user's achievement data.
achievs.getAchievementsForProfile = function getAchievementsForProfile (user, language) {
  const result = {
    basic: {
      label: 'Basic',
      achievements: _getBasicAchievements(user, language),
    },
    onboarding: {
      label: 'Onboarding',
      achievements: _getOnboardingAchievements(user, language),
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

achievs.getContribText = contribText;

export default achievs;
