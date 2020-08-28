import each from 'lodash/each';

const achievementsData = {};

const worldQuestAchievs = {
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
  dysheartenerQuest: {
    icon: 'achievement-dysheartener',
    titleKey: 'achievementDysheartener',
    textKey: 'achievementDysheartenerText',
  },
};
Object.assign(achievementsData, worldQuestAchievs);

const seasonalSpellAchievs = {
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

const masterAchievs = {
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

const basicAchievs = {
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
  mindOverMatter: {
    icon: 'achievement-mindOverMatter',
    titleKey: 'achievementMindOverMatter',
    textKey: 'achievementMindOverMatterText',
  },
  justAddWater: {
    icon: 'achievement-justAddWater',
    titleKey: 'achievementJustAddWater',
    textKey: 'achievementJustAddWaterText',
  },
  backToBasics: {
    icon: 'achievement-backToBasics',
    titleKey: 'achievementBackToBasics',
    textKey: 'achievementBackToBasicsText',
  },
  allYourBase: {
    icon: 'achievement-allYourBase',
    titleKey: 'achievementAllYourBase',
    textKey: 'achievementAllYourBaseText',
  },
  dustDevil: {
    icon: 'achievement-dustDevil',
    titleKey: 'achievementDustDevil',
    textKey: 'achievementDustDevilText',
  },
  aridAuthority: {
    icon: 'achievement-aridAuthority',
    titleKey: 'achievementAridAuthority',
    textKey: 'achievementAridAuthorityText',
  },
  monsterMagus: {
    icon: 'achievement-monsterMagus',
    titleKey: 'achievementMonsterMagus',
    textKey: 'achievementMonsterMagusText',
  },
  undeadUndertaker: {
    icon: 'achievement-undeadUndertaker',
    titleKey: 'achievementUndeadUndertaker',
    textKey: 'achievementUndeadUndertakerText',
  },
  primedForPainting: {
    icon: 'achievement-primedForPainting',
    titleKey: 'achievementPrimedForPainting',
    textKey: 'achievementPrimedForPaintingText',
  },
  pearlyPro: {
    icon: 'achievement-pearlyPro',
    titleKey: 'achievementPearlyPro',
    textKey: 'achievementPearlyProText',
  },
  tickledPink: {
    icon: 'achievement-tickledPink',
    titleKey: 'achievementTickledPink',
    textKey: 'achievementTickledPinkText',
  },
  rosyOutlook: {
    icon: 'achievement-rosyOutlook',
    titleKey: 'achievementRosyOutlook',
    textKey: 'achievementRosyOutlookText',
  },
  bugBonanza: {
    icon: 'achievement-bugBonanza',
    titleKey: 'achievementBugBonanza',
    textKey: 'achievementBugBonanzaText',
  },
  bareNecessities: {
    icon: 'achievement-bareNecessities',
    titleKey: 'achievementBareNecessities',
    textKey: 'achievementBareNecessitiesText',
  },
  freshwaterFriends: {
    icon: 'achievement-freshwaterFriends',
    titleKey: 'achievementFreshwaterFriends',
    textKey: 'achievementFreshwaterFriendsText',
  },
};
Object.assign(achievementsData, basicAchievs);

const onboardingAchievs = {
  createdTask: {
    icon: 'achievement-createdTask',
    titleKey: 'achievementCreatedTask',
    textKey: 'achievementCreatedTaskText',
  },
  completedTask: {
    icon: 'achievement-completedTask',
    titleKey: 'achievementCompletedTask',
    textKey: 'achievementCompletedTaskText',
  },
  hatchedPet: {
    icon: 'achievement-hatchedPet',
    titleKey: 'achievementHatchedPet',
    textKey: 'achievementHatchedPetText',
  },
  fedPet: {
    icon: 'achievement-fedPet',
    titleKey: 'achievementFedPet',
    textKey: 'achievementFedPetText',
  },
  purchasedEquipment: {
    icon: 'achievement-purchasedEquipment',
    titleKey: 'achievementPurchasedEquipment',
    textKey: 'achievementPurchasedEquipmentText',
  },
};
Object.assign(achievementsData, onboardingAchievs);

const specialAchievs = {
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
  kickstarter2019: {
    icon: 'achievement-kickstarter2019',
    titleKey: 'achievementKickstarter2019',
    textKey: 'achievementKickstarter2019Text',
  },
};
Object.assign(achievementsData, specialAchievs);

const holidayAchievs = {
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

const ultimateGearAchievs = ['healer', 'rogue', 'warrior', 'mage'].reduce((achievs, type) => {
  achievs[`${type}UltimateGear`] = {
    icon: `achievement-ultimate-${type}`,
    titleKey: 'ultimGearName',
    textKey: 'ultimGearText',
  };
  return achievs;
}, {});
Object.assign(achievementsData, ultimateGearAchievs);

const cardAchievs = ['greeting', 'thankyou', 'nye', 'valentine', 'birthday', 'congrats', 'getwell', 'goodluck'].reduce((achievs, type) => {
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

export default achievementsData;
