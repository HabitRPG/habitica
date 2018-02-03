import each from 'lodash/each';

let achievementsData = {};

let worldQuestAchievs = {
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
};
Object.assign(achievementsData, worldQuestAchievs);

let seasonalSpellAchievs = {
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
};
Object.assign(achievementsData, seasonalSpellAchievs);

let masterAchievs = {
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
};
Object.assign(achievementsData, masterAchievs);

let basicAchievs = {
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
  royallyLoyal: {
    icon: 'achievement-royally-loyal',
    titleKey: 'royallyLoyal',
    textKey: 'royallyLoyalText',
  },
  joinedGuild: {
    icon: 'achievement-guild',
    titleKey: 'joinedGuild',
    textKey: 'joinedGuildText',
  },
  joinedChallenge: {
    icon: 'achievement-challenge',
    titleKey: 'joinedChallenge',
    textKey: 'joinedChallengeText',
  },
  invitedFriend: {
    icon: 'achievement-friends',
    titleKey: 'invitedFriend',
    textKey: 'invitedFriendText',
  },
  lostMasterclasser: {
    icon: 'achievement-lostMasterclasser',
    titleKey: 'achievementLostMasterclasser',
    textKey: 'achievementLostMasterclasserText',
  },
};
Object.assign(achievementsData, basicAchievs);

let specialAchievs = {
  contributor: {
    icon: 'achievement-boot',
    titleKey: 'contribName',
    textKey: 'contribText',
  },
  npc: {
    icon: 'achievement-npc',
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
  habitSurveys: {
    icon: 'achievement-tree',
    singularTitleKey: 'helped',
    singularTextKey: 'surveysSingle',
    pluralTitleKey: 'helped',
    pluralTextKey: 'surveysMultiple',
  },
};
Object.assign(achievementsData, specialAchievs);

let holidayAchievs = {
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
};
Object.assign(achievementsData, holidayAchievs);

let ultimateGearAchievs = ['healer', 'rogue', 'warrior', 'mage'].reduce((achievs, type) => {
  achievs[`${type}UltimateGear`] = {
    icon: `achievement-ultimate-${type}`,
    titleKey: 'ultimGearName',
    textKey: 'ultimGearText',
  };
  return achievs;
}, {});
Object.assign(achievementsData, ultimateGearAchievs);

let cardAchievs = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday', 'congrats', 'getwell', 'goodluck'].reduce((achievs, type) => {
  achievs[`${type}Cards`] = {
    icon: `achievement-${type}`,
    titleKey: `${type}CardAchievementTitle`,
    textKey: `${type}CardAchievementText`,
  };
  return achievs;
}, {});
Object.assign(achievementsData, cardAchievs);

each(achievementsData, (value, key) => {
  value.key = key;
});

module.exports = achievementsData;
