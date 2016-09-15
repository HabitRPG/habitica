import { each } from 'lodash';

let achievementsData = {
  dilatoryQuest: {
    icon: 'achievement-dilatory',
    titleKey: 'achievementDilatory',
    textKey: 'achievementDilatoryText',
  },
  stressbeastQuest: {
    icon: 'achievement-stoikalm',
    titleKey: 'achievementStressbeast',
    textKey: 'achievementStressbeastText',
  },
  burnoutQuest: {
    icon: 'achievement-burnout',
    titleKey: 'achievementBurnout',
    textKey: 'achievementBurnoutText',
  },
  bewilderQuest: {
    icon: 'achievement-bewilder',
    titleKey: 'achievementBewilder',
    textKey: 'achievementBewilderText',
  },
  partyUp: {
    icon: 'achievement-partyUp',
    titleKey: 'partyUpName',
    textKey: 'partyUpText',
  },
  partyOn: {
    icon: 'achievement-partyOn',
    titleKey: 'partyOnName',
    textKey: 'partyOnText',
  },
  snowball: {
    icon: 'achievement-snowball',
    titleKey: 'annoyingFriends',
    textKey: 'annoyingFriendsText',
  },
  spookySparkles: {
    icon: 'achievement-spookySparkles',
    titleKey: 'alarmingFriends',
    textKey: 'alarmingFriendsText',
  },
  shinySeed: {
    icon: 'achievement-shinySeed',
    titleKey: 'agriculturalFriends',
    textKey: 'agriculturalFriendsText',
  },
  seafoam: {
    icon: 'achievement-seafoam',
    titleKey: 'aquaticFriends',
    textKey: 'aquaticFriendsText',
  },
  contributor: {
    icon: 'achievement-boot',
    titleKey: 'contribName',
    textKey: 'contribText',
  },
  npc: {
    icon: 'achievement-ultimate-warrior',
    titleKey: 'npcAchievementName',
    textKey: 'npcAchievementText',
  },
  kickstarter: {
    icon: 'achievement-heart',
    titleKey: 'kickstartName',
    textKey: 'kickstartText',
  },
  veteran: {
    icon: 'achievement-cake',
    titleKey: 'veteran',
    textKey: 'veteranText',
  },
  originalUser: {
    icon: 'achievement-alpha',
    titleKey: 'originalUser',
    textKey: 'originalUserText',
  },
  beastMaster: {
    icon: 'achievement-rat',
    titleKey: 'beastMasterName',
    textKey: 'beastMasterText',
    text2Key: 'beastMasterText2',
  },
  mountMaster: {
    icon: 'achievement-wolf',
    titleKey: 'mountMasterName',
    textKey: 'mountMasterText',
    text2Key: 'mountMasterText2',
  },
  triadBingo: {
    icon: 'achievement-triadbingo',
    titleKey: 'triadBingoName',
    textKey: 'triadBingoText',
    text2Key: 'triadBingoText2',
  },
  streak: {
    icon: 'achievement-thermometer',
    singularTitleKey: 'streakSingular',
    singularTextKey: 'streakSingularText',
    pluralTitleKey: 'streakName',
    pluralTextKey: 'streakText',
  },
  perfect: {
    icon: 'achievement-perfect',
    singularTitleKey: 'perfectSingular',
    singularTextKey: 'perfectSingularText',
    pluralTitleKey: 'perfectName',
    pluralTextKey: 'perfectText',
  },
  habiticaDays: {
    icon: 'achievement-habiticaDay',
    singularTitleKey: 'habiticaDay',
    singularTextKey: 'habiticaDaySingularText',
    pluralTitleKey: 'habiticaDay',
    pluralTextKey: 'habiticaDayPluralText',
  },
  habitBirthdays: {
    icon: 'achievement-habitBirthday',
    singularTitleKey: 'habitBirthday',
    singularTextKey: 'habitBirthdayText',
    pluralTitleKey: 'habitBirthday',
    pluralTextKey: 'habitBirthdayPluralText',
  },
  costumeContests: {
    icon: 'achievement-costumeContest',
    singularTitleKey: 'costumeContest',
    singularTextKey: 'costumeContestText',
    pluralTitleKey: 'costumeContest',
    pluralTextKey: 'costumeContestTextPlural',
  },
  habitSurveys: {
    icon: 'achievement-tree',
    singularTitleKey: 'helped',
    singularTextKey: 'surveysSingle',
    pluralTitleKey: 'helped',
    pluralTextKey: 'surveysMultiple',
  },
};

let ultimateGearTypes = ['healer', 'rogue', 'warrior', 'mage'];
each(ultimateGearTypes, (type) => {
  achievementsData[`${type}UltimateGear`] = {
    icon: `achievement-ultimate-${type}`,
    titleKey: 'ultimGearName',
    textKey: 'ultimGearText',
  };
});

let cardTypes = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday'];
each(cardTypes, (type) => {
  achievementsData[`${type}Cards`] = {
    icon: `achievement-${type}`,
    titleKey: `${type}CardAchievementTitle`,
    textKey: `${type}CardAchievementText`,
  };
});

each(achievementsData, (value, key) => {
  value.key = key;
});

module.exports = achievementsData;
