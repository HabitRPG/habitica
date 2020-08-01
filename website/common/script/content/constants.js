/* eslint-disable key-spacing */

import moment from 'moment';

export const CURRENT_SEASON = moment().isBefore('2020-08-02') ? 'summer' : '_NONE_';

export const CLASSES = [
  'warrior',
  'rogue',
  'healer',
  'wizard',
];

// IMPORTANT: The end date should be one to two days AFTER the actual end of
// the event, to allow people in different timezones to still buy the
// event gear up until at least the actual end of the event.

export const EVENTS = {
  winter:     { start: '2013-12-31', end: '2014-02-01' },
  birthday:   { start: '2017-01-31', end: '2017-02-02' },
  spring:     { start: '2014-03-21', end: '2014-05-01' },
  summer:     { start: '2014-06-20', end: '2014-08-01' },
  fall:       { start: '2014-09-21', end: '2014-11-01' },
  winter2015: { start: '2014-12-21', end: '2015-02-02' },
  spring2015: { start: '2015-03-20', end: '2015-05-02' },
  summer2015: { start: '2015-06-20', end: '2015-08-02' },
  fall2015:   { start: '2015-09-21', end: '2015-11-01' },
  gaymerx:    { start: '2016-09-29', end: '2016-10-03' },
  winter2016: { start: '2015-12-18', end: '2016-02-02' },
  spring2016: { start: '2016-03-18', end: '2016-05-02' },
  summer2016: { start: '2016-06-21', end: '2016-08-02' },
  fall2016:   { start: '2016-09-20', end: '2016-11-02' },
  winter2017: { start: '2016-12-16', end: '2017-02-02' },
  spring2017: { start: '2017-03-21', end: '2017-05-02' },
  summer2017: { start: '2017-06-20', end: '2017-08-02' },
  fall2017:   { start: '2017-09-21', end: '2017-11-02' },
  winter2018: { start: '2017-12-19', end: '2018-02-02' },
  spring2018: { start: '2018-03-20', end: '2018-05-02' },
  summer2018: { start: '2018-06-19', end: '2018-08-02' },
  fall2018:   { start: '2018-09-20', end: '2018-11-02' },
  winter2019: { start: '2018-12-19', end: '2019-02-02' },
  spring2019: { start: '2019-03-19', end: '2019-05-02' },
  summer2019: { start: '2019-06-18', end: '2019-08-02' },
  fall2019:   { start: '2019-09-24', end: '2019-11-02' },
  winter2020: { start: '2019-12-19', end: '2020-02-02' },
  spring2020: { start: '2020-03-17', end: '2020-05-02' },
  summer2020: { start: '2020-06-18', end: '2020-08-02' },
};

export const SEASONAL_SETS = {
  winter: [
    // winter 2014
    'candycaneSet',
    'skiSet',
    'snowflakeSet',
    'yetiSet',

    // winter 2015
    'northMageSet',
    'icicleDrakeSet',
    'soothingSkaterSet',
    'gingerbreadSet',

    // winter 2016
    'snowDaySet',
    'snowboardingSet',
    'festiveFairySet',
    'cocoaSet',

    // winter 2017
    'winter2017IceHockeySet',
    'winter2017WinterWolfSet',
    'winter2017SugarPlumSet',
    'winter2017FrostyRogueSet',

    // winter 2018
    'winter2018ConfettiSet',
    'winter2018GiftWrappedSet',
    'winter2018MistletoeSet',
    'winter2018ReindeerSet',

    // winter 2019
    'winter2019PoinsettiaSet',
    'winter2019WinterStarSet',
    'winter2019BlizzardSet',
    'winter2019PyrotechnicSet',

    // winter 2020
    'winter2020CarolOfTheMageSet',
    'winter2020LanternSet',
    'winter2020EvergreenSet',
    'winter2020WinterSpiceSet',
  ],
  spring: [
    // spring 2014
    'mightyBunnySet',
    'magicMouseSet',
    'lovingPupSet',
    'stealthyKittySet',

    // spring 2015
    'bewareDogSet',
    'magicianBunnySet',
    'comfortingKittySet',
    'sneakySqueakerSet',

    // spring 2016
    'springingBunnySet',
    'grandMalkinSet',
    'cleverDogSet',
    'braveMouseSet',

    // spring 2017
    'spring2017FelineWarriorSet',
    'spring2017CanineConjurorSet',
    'spring2017FloralMouseSet',
    'spring2017SneakyBunnySet',

    // spring 2018
    'spring2018TulipMageSet',
    'spring2018SunriseWarriorSet',
    'spring2018DucklingRogueSet',
    'spring2018GarnetHealerSet',

    // spring 2019
    'spring2019AmberMageSet',
    'spring2019OrchidWarriorSet',
    'spring2019CloudRogueSet',
    'spring2019RobinHealerSet',

    // spring 2020

    'spring2020BeetleWarriorSet',
    'spring2020IrisHealerSet',
    'spring2020LapisLazuliRogueSet',
    'spring2020PuddleMageSet',
  ],
  summer: [
    // summer 2014
    'daringSwashbucklerSet',
    'emeraldMermageSet',
    'reefSeahealerSet',
    'roguishPirateSet',

    // summer 2015
    'sunfishWarriorSet',
    'shipSoothsayerSet',
    'strappingSailorSet',
    'reefRenegadeSet',

    // summer 2016
    'summer2016SharkWarriorSet',
    'summer2016DolphinMageSet',
    'summer2016SeahorseHealerSet',
    'summer2016EelSet',

    // summer 2017
    'summer2017SandcastleWarriorSet',
    'summer2017WhirlpoolMageSet',
    'summer2017SeashellSeahealerSet',
    'summer2017SeaDragonSet',

    // summer 2018
    'summer2018BettaFishWarriorSet',
    'summer2018LionfishMageSet',
    'summer2018MerfolkMonarchSet',
    'summer2018FisherRogueSet',

    // summer 2019
    'summer2019SeaTurtleWarriorSet',
    'summer2019WaterLilyMageSet',
    'summer2019ConchHealerSet',
    'summer2019HammerheadRogueSet',

    // summer 2020
    'summer2020SeaGlassHealerSet',
    'summer2020OarfishMageSet',
    'summer2020CrocodileRogueSet',
    'summer2020RainbowTroutWarriorSet',
  ],
  fall: [
    // fall 2014
    'vampireSmiterSet',
    'monsterOfScienceSet',
    'witchyWizardSet',
    'mummyMedicSet',

    // fall 2015
    'battleRogueSet',
    'scarecrowWarriorSet',
    'stitchWitchSet',
    'potionerSet',

    // fall 2016
    'fall2016BlackWidowSet',
    'fall2016SwampThingSet',
    'fall2016WickedSorcererSet',
    'fall2016GorgonHealerSet',

    // fall 2017
    'fall2017TrickOrTreatSet',
    'fall2017HabitoweenSet',
    'fall2017MasqueradeSet',
    'fall2017HauntedHouseSet',

    // fall 2018
    'fall2018MinotaurWarriorSet',
    'fall2018CandymancerMageSet',
    'fall2018CarnivorousPlantSet',
    'fall2018AlterEgoSet',

    // fall 2019
    'fall2019CyclopsSet',
    'fall2019LichSet',
    'fall2019OperaticSpecterSet',
    'fall2019RavenSet',
  ],
};

export const GEAR_TYPES = [
  'weapon',
  'armor',
  'head',
  'shield',
  'body',
  'back',
  'headAccessory',
  'eyewear',
];

export const ITEM_LIST = {
  weapon:          { localeKey: 'weapon', isEquipment: true },
  armor:           { localeKey: 'armor', isEquipment: true },
  head:            { localeKey: 'headgear', isEquipment: true },
  shield:          { localeKey: 'offhand', isEquipment: true },
  back:            { localeKey: 'back', isEquipment: true },
  body:            { localeKey: 'body', isEquipment: true },
  headAccessory:   { localeKey: 'headAccessory', isEquipment: true },
  eyewear:         { localeKey: 'eyewear', isEquipment: true },
  hatchingPotions: { localeKey: 'hatchingPotion', isEquipment: false },
  premiumHatchingPotions: { localeKey: 'hatchingPotion', isEquipment: false },
  eggs:            { localeKey: 'eggSingular', isEquipment: false },
  quests:          { localeKey: 'quest', isEquipment: false },
  food:            { localeKey: 'foodTextThe', isEquipment: false },
  Saddle:          { localeKey: 'foodSaddleText', isEquipment: false },
  bundles:         { localeKey: 'discountBundle', isEquipment: false },
};

export const USER_CAN_OWN_QUEST_CATEGORIES = [
  'unlockable',
  'gold',
  'hatchingPotion',
  'pet',
];

export const QUEST_SERIES_ACHIEVEMENTS = {
  lostMasterclasser: [
    'dilatoryDistress1',
    'dilatoryDistress2',
    'dilatoryDistress3',
    'mayhemMistiflying1',
    'mayhemMistiflying2',
    'mayhemMistiflying3',
    'stoikalmCalamity1',
    'stoikalmCalamity2',
    'stoikalmCalamity3',
    'taskwoodsTerror1',
    'taskwoodsTerror2',
    'taskwoodsTerror3',
    'lostMasterclasser1',
    'lostMasterclasser2',
    'lostMasterclasser3',
    'lostMasterclasser4',
  ],
  mindOverMatter: [
    'rock',
    'slime',
    'yarn',
  ],
  justAddWater: [
    'octopus',
    'dilatory_derby',
    'kraken',
    'whale',
    'turtle',
    'nudibranch',
    'seaserpent',
    'dolphin',
  ],
  bugBonanza: [
    'beetle',
    'butterfly',
    'snail',
    'spider',
  ],
  bareNecessities: [
    'monkey',
    'sloth',
    'treeling',
  ],
  freshwaterFriends: [
    'axolotl',
    'frog',
    'hippo',
  ],
};

export const ANIMAL_COLOR_ACHIEVEMENTS = [
  {
    color: 'Base',
    petAchievement: 'backToBasics',
    petNotificationType: 'ACHIEVEMENT_BACK_TO_BASICS',
    mountAchievement: 'allYourBase',
    mountNotificationType: 'ACHIEVEMENT_ALL_YOUR_BASE',
  },
  {
    color: 'Desert',
    petAchievement: 'dustDevil',
    petNotificationType: 'ACHIEVEMENT_DUST_DEVIL',
    mountAchievement: 'aridAuthority',
    mountNotificationType: 'ACHIEVEMENT_ARID_AUTHORITY',
  },
  {
    color: 'Zombie',
    petAchievement: 'monsterMagus',
    petNotificationType: 'ACHIEVEMENT_MONSTER_MAGUS',
    mountAchievement: 'undeadUndertaker',
    mountNotificationType: 'ACHIEVEMENT_UNDEAD_UNDERTAKER',
  },
  {
    color: 'White',
    petAchievement: 'primedForPainting',
    petNotificationType: 'ACHIEVEMENT_PRIMED_FOR_PAINTING',
    mountAchievement: 'pearlyPro',
    mountNotificationType: 'ACHIEVEMENT_PEARLY_PRO',
  },
  {
    color: 'CottonCandyPink',
    petAchievement: 'tickledPink',
    petNotificationType: 'ACHIEVEMENT_TICKLED_PINK',
    mountAchievement: 'rosyOutlook',
    mountNotificationType: 'ACHIEVEMENT_ROSY_OUTLOOK',
  },
];
