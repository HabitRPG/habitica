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

const stableAchievs = {
  beastMaster: {
    icon: 'achievement-rat',
    titleKey: 'beastMasterName',
    textKey: 'beastMasterText',
    text2Key: 'beastMasterText2',
    notificationText: 'beastAchievement',
  },
  mountMaster: {
    icon: 'achievement-wolf',
    titleKey: 'mountMasterName',
    textKey: 'mountMasterText',
    text2Key: 'mountMasterText2',
    notificationText: 'mountAchievement',
  },
  triadBingo: {
    icon: 'achievement-triadbingo',
    titleKey: 'triadBingoName',
    textKey: 'triadBingoText',
    text2Key: 'triadBingoText2',
    notificationText: 'triadBingoAchievement',
  },
};
Object.assign(achievementsData, stableAchievs);

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
};
Object.assign(achievementsData, basicAchievs);

const questSeriesAchievs = {
  lostMasterclasser: {
    icon: 'achievement-lostMasterclasser',
    titleKey: 'achievementLostMasterclasser',
    textKey: 'achievementLostMasterclasserText',
  },
  bareNecessities: {
    icon: 'achievement-bareNecessities',
    titleKey: 'achievementBareNecessities',
    textKey: 'achievementBareNecessitiesText',
  },
  bugBonanza: {
    icon: 'achievement-bugBonanza',
    titleKey: 'achievementBugBonanza',
    textKey: 'achievementBugBonanzaText',
  },
  freshwaterFriends: {
    icon: 'achievement-freshwaterFriends',
    titleKey: 'achievementFreshwaterFriends',
    textKey: 'achievementFreshwaterFriendsText',
  },
  justAddWater: {
    icon: 'achievement-justAddWater',
    titleKey: 'achievementJustAddWater',
    textKey: 'achievementJustAddWaterText',
  },
  mindOverMatter: {
    icon: 'achievement-mindOverMatter',
    titleKey: 'achievementMindOverMatter',
    textKey: 'achievementMindOverMatterText',
  },
  seasonalSpecialist: {
    icon: 'achievement-seasonalSpecialist',
    titleKey: 'achievementSeasonalSpecialist',
    textKey: 'achievementSeasonalSpecialistText',
  },
};
Object.assign(achievementsData, questSeriesAchievs);

const animalSetAchievs = {
  legendaryBestiary: {
    icon: 'achievement-legendaryBestiary',
    titleKey: 'achievementLegendaryBestiary',
    textKey: 'achievementLegendaryBestiaryText',
  },
  birdsOfAFeather: {
    icon: 'achievement-birdsOfAFeather',
    titleKey: 'achievementBirdsOfAFeather',
    textKey: 'achievementBirdsOfAFeatherText',
  },
  dinosaurDynasty: {
    icon: 'achievement-dinosaurDynasty',
    titleKey: 'achievementDinosaurDynasty',
    textKey: 'achievementDinosaurDynastyText',
  },
  domesticated: {
    icon: 'achievement-domesticated',
    titleKey: 'achievementDomesticated',
    textKey: 'achievementDomesticatedText',
  },
  plantParent: {
    icon: 'achievement-plantParent',
    titleKey: 'achievementPlantParent',
    textKey: 'achievementPlantParentText',
  },
  polarPro: {
    icon: 'achievement-polarPro',
    titleKey: 'achievementPolarPro',
    textKey: 'achievementPolarProText',
  },
  reptacularRumble: {
    icon: 'achievement-reptacularRumble',
    titleKey: 'achievementReptacularRumble',
    textKey: 'achievementReptacularRumbleText',
  },
  woodlandWizard: {
    icon: 'achievement-woodlandWizard',
    titleKey: 'achievementWoodlandWizard',
    textKey: 'achievementWoodlandWizardText',
  },
  zodiacZookeeper: {
    icon: 'achievement-zodiac',
    titleKey: 'achievementZodiacZookeeper',
    textKey: 'achievementZodiacZookeeperText',
  },
};
Object.assign(achievementsData, animalSetAchievs);

const petColorAchievs = {
  backToBasics: {
    icon: 'achievement-backToBasics',
    titleKey: 'achievementBackToBasics',
    textKey: 'achievementBackToBasicsText',
  },
  dustDevil: {
    icon: 'achievement-dustDevil',
    titleKey: 'achievementDustDevil',
    textKey: 'achievementDustDevilText',
  },
  monsterMagus: {
    icon: 'achievement-monsterMagus',
    titleKey: 'achievementMonsterMagus',
    textKey: 'achievementMonsterMagusText',
  },
  primedForPainting: {
    icon: 'achievement-primedForPainting',
    titleKey: 'achievementPrimedForPainting',
    textKey: 'achievementPrimedForPaintingText',
  },
  tickledPink: {
    icon: 'achievement-tickledPink',
    titleKey: 'achievementTickledPink',
    textKey: 'achievementTickledPinkText',
  },
  goodAsGold: {
    icon: 'achievement-goodAsGold',
    titleKey: 'achievementGoodAsGold',
    textKey: 'achievementGoodAsGoldText',
  },
  boneCollector: {
    icon: 'achievement-boneCollector',
    titleKey: 'achievementBoneCollector',
    textKey: 'achievementBoneCollectorText',
  },
  seeingRed: {
    icon: 'achievement-seeingRed',
    titleKey: 'achievementSeeingRed',
    textKey: 'achievementSeeingRedText',
    modalTextKey: 'achievementSeeingRedModalText',
  },
  violetsAreBlue: {
    icon: 'achievement-violetsAreBlue',
    titleKey: 'achievementVioletsAreBlue',
    textKey: 'achievementVioletsAreBlueText',
  },
  shadyCustomer: {
    icon: 'achievement-shadyCustomer',
    titleKey: 'achievementShadyCustomer',
    textKey: 'achievementShadyCustomerText',
  },
};
Object.assign(achievementsData, petColorAchievs);

const mountColorAchievs = {
  allYourBase: {
    icon: 'achievement-allYourBase',
    titleKey: 'achievementAllYourBase',
    textKey: 'achievementAllYourBaseText',
  },
  aridAuthority: {
    icon: 'achievement-aridAuthority',
    titleKey: 'achievementAridAuthority',
    textKey: 'achievementAridAuthorityText',
  },
  undeadUndertaker: {
    icon: 'achievement-undeadUndertaker',
    titleKey: 'achievementUndeadUndertaker',
    textKey: 'achievementUndeadUndertakerText',
  },
  pearlyPro: {
    icon: 'achievement-pearlyPro',
    titleKey: 'achievementPearlyPro',
    textKey: 'achievementPearlyProText',
  },
  rosyOutlook: {
    icon: 'achievement-rosyOutlook',
    titleKey: 'achievementRosyOutlook',
    textKey: 'achievementRosyOutlookText',
  },
  allThatGlitters: {
    icon: 'achievement-allThatGlitters',
    titleKey: 'achievementAllThatGlitters',
    textKey: 'achievementAllThatGlittersText',
  },
  skeletonCrew: {
    icon: 'achievement-skeletonCrew',
    titleKey: 'achievementSkeletonCrew',
    textKey: 'achievementSkeletonCrewText',
  },
  redLetterDay: {
    icon: 'achievement-redLetterDay',
    titleKey: 'achievementRedLetterDay',
    textKey: 'achievementRedLetterDayText',
  },
  wildBlueYonder: {
    icon: 'achievement-wildBlueYonder',
    titleKey: 'achievementWildBlueYonder',
    textKey: 'achievementWildBlueYonderText',
  },
  shadeOfItAll: {
    icon: 'achievement-shadeOfItAll',
    titleKey: 'achievementShadeOfItAll',
    textKey: 'achievementShadeOfItAllText',
  },
};
Object.assign(achievementsData, mountColorAchievs);

const petSetCompleteAchievs = {
  boneToPick: {
    icon: 'achievement-boneToPick',
    titleKey: 'achievementBoneToPick',
    textKey: 'achievementBoneToPickText',
  },
};
Object.assign(achievementsData, petSetCompleteAchievs);

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
  groupsBeta2022: {
    icon: 'achievement-groupsBeta2022',
    titleKey: 'achievementGroupsBeta2022',
    textKey: 'achievementGroupsBeta2022Text',
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
