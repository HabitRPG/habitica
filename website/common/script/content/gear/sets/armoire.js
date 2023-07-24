import defaults from 'lodash/defaults';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import upperFirst from 'lodash/upperFirst';
import { ownsItem } from '../gear-helper';
import { ATTRIBUTES } from '../../../constants';
import t from '../../translation';

const armor = {
  lunarArmor: {
    notes: t('armorArmoireLunarArmorNotes', { str: 7, int: 7 }),
    str: 7,
    int: 7,
    set: 'soothing',
  },
  gladiatorArmor: {
    notes: t('armorArmoireGladiatorArmorNotes', { str: 7, per: 7 }),
    str: 7,
    per: 7,
    set: 'gladiator',
  },
  rancherRobes: {
    notes: t('armorArmoireRancherRobesNotes', { str: 5, per: 5, int: 5 }),
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
  },
  goldenToga: {
    str: 8,
    con: 8,
    set: 'goldenToga',
  },
  hornedIronArmor: {
    con: 9,
    per: 7,
    set: 'hornedIron',
  },
  plagueDoctorOvercoat: {
    int: 6,
    str: 5,
    con: 6,
    set: 'plagueDoctor',
  },
  shepherdRobes: {
    str: 9,
    per: 9,
    set: 'shepherd',
  },
  royalRobes: {
    con: 5,
    per: 5,
    int: 5,
    set: 'royal',
  },
  crystalCrescentRobes: {
    per: 7,
    con: 7,
    set: 'crystalCrescent',
  },
  dragonTamerArmor: {
    con: 15,
    set: 'dragonTamer',
  },
  barristerRobes: {
    con: 10,
    set: 'barrister',
  },
  jesterCostume: {
    int: 15,
    set: 'jester',
  },
  minerOveralls: {
    con: 10,
    set: 'miner',
  },
  basicArcherArmor: {
    per: 12,
    set: 'basicArcher',
  },
  graduateRobe: {
    int: 10,
    set: 'graduate',
  },
  stripedSwimsuit: {
    con: 13,
    set: 'seaside',
  },
  cannoneerRags: {
    con: 15,
    set: 'cannoneer',
  },
  falconerArmor: {
    con: 10,
    set: 'falconer',
  },
  vermilionArcherArmor: {
    per: 15,
    set: 'vermilionArcher',
  },
  ogreArmor: {
    con: 15,
    set: 'ogre',
  },
  ironBlueArcherArmor: {
    str: 12,
    set: 'blueArcher',
  },
  redPartyDress: {
    str: 7,
    con: 7,
    int: 7,
    set: 'redHairbow',
  },
  woodElfArmor: {
    per: 12,
    set: 'woodElf',
  },
  ramFleeceRobes: {
    con: 9,
    str: 7,
    set: 'ramBarbarian',
  },
  gownOfHearts: {
    con: 13,
    set: 'queenOfHearts',
  },
  mushroomDruidArmor: {
    con: 7,
    per: 8,
    set: 'mushroomDruid',
  },
  greenFestivalYukata: {
    con: 8,
    per: 8,
    set: 'festivalAttire',
  },
  merchantTunic: {
    per: 10,
    set: 'merchant',
  },
  vikingTunic: {
    con: 6,
    str: 8,
    set: 'viking',
  },
  swanDancerTutu: {
    int: 8,
    str: 8,
    set: 'swanDancer',
  },
  yellowPartyDress: {
    per: 7,
    int: 7,
    str: 7,
    set: 'yellowHairbow',
  },
  antiProcrastinationArmor: {
    str: 15,
    set: 'antiProcrastination',
  },
  farrierOutfit: {
    con: 6,
    int: 6,
    per: 6,
    set: 'farrier',
  },
  candlestickMakerOutfit: {
    con: 12,
    set: 'candlestickMaker',
  },
  wovenRobes: {
    con: 8,
    int: 9,
    set: 'weaver',
  },
  lamplightersGreatcoat: {
    per: 14,
    set: 'lamplighter',
  },
  coachDriverLivery: {
    str: 12,
    set: 'coachDriver',
  },
  robeOfDiamonds: {
    per: 13,
    set: 'kingOfDiamonds',
  },
  flutteryFrock: {
    con: 5,
    per: 5,
    str: 5,
    set: 'fluttery',
  },
  cobblersCoveralls: {
    per: 7,
    str: 7,
    set: 'cobbler',
  },
  glassblowersCoveralls: {
    con: 8,
    set: 'glassblower',
  },
  bluePartyDress: {
    con: 7,
    per: 7,
    str: 7,
    set: 'blueHairbow',
  },
  piraticalPrincessGown: {
    per: 7,
    set: 'piraticalPrincess',
  },
  jeweledArcherArmor: {
    con: 15,
    set: 'jeweledArcher',
  },
  coverallsOfBookbinding: {
    con: 10,
    per: 5,
    set: 'bookbinder',
  },
  robeOfSpades: {
    str: 13,
    set: 'aceOfSpades',
  },
  softBlueSuit: {
    int: 10,
    per: 5,
    set: 'blueLoungewear',
  },
  softGreenSuit: {
    int: 7,
    con: 7,
    set: 'greenLoungewear',
  },
  softRedSuit: {
    int: 8,
    str: 5,
    set: 'redLoungewear',
  },
  scribesRobe: {
    int: 7,
    per: 7,
    set: 'scribe',
  },
  chefsJacket: {
    int: 10,
    set: 'chef',
  },
  vernalVestment: {
    str: 6,
    int: 6,
    set: 'vernalVestments',
  },
  nephriteArmor: {
    str: 7,
    per: 6,
    set: 'nephrite',
  },
  boatingJacket: {
    int: 6,
    per: 6,
    str: 6,
    set: 'boating',
  },
  astronomersRobe: {
    per: 8,
    con: 8,
    set: 'astronomer',
  },
  invernessCape: {
    per: 7,
    int: 7,
    set: 'detective',
  },
  shadowMastersRobe: {
    con: 12,
    set: 'shadowMaster',
  },
  alchemistsRobe: {
    con: 8,
    per: 5,
    set: 'alchemist',
  },
  duffleCoat: {
    con: 7,
    per: 7,
    set: 'duffle',
  },
  layerCakeArmor: {
    con: 13,
    set: 'birthday',
  },
  matchMakersApron: {
    con: 7,
    str: 7,
    int: 7,
    set: 'matchMaker',
  },
  baseballUniform: {
    con: 10,
    str: 10,
    set: 'baseball',
  },
  boxArmor: {
    per: 5,
    con: 5,
    set: 'paperKnight',
  },
  fiddlersCoat: {
    con: 6,
    set: 'fiddler',
  },
  pirateOutfit: {
    con: 4,
    int: 4,
    set: 'pirate',
  },
  heroicHerbalistRobe: {
    con: 7,
    int: 7,
    set: 'herbalist',
  },
  guardiansGown: {
    int: 7,
    set: 'grazerGuardian',
  },
  autumnEnchantersCloak: {
    int: 12,
    set: 'autumnEnchanter',
  },
  doubletOfClubs: {
    con: 10,
    set: 'jackOfClubs',
  },
  dressingGown: {
    con: 12,
    set: 'dressingGown',
  },
  blueMoonShozoku: {
    con: 8,
    set: 'blueMoon',
  },
  softPinkSuit: {
    per: 12,
    set: 'pinkLoungewear',
  },
  jadeArmor: {
    per: 8,
    set: 'jadeWarrior',
  },
  clownsMotley: {
    str: 7,
    set: 'clown',
  },
  medievalLaundryOutfit: {
    con: 6,
    set: 'medievalLaunderers',
  },
  medievalLaundryDress: {
    con: 6,
    set: 'medievalLaunderers',
  },
  bathtub: {
    con: 8,
    set: 'bath',
  },
  bagpipersKilt: {
    con: 6,
    set: 'bonnieBagpiper',
  },
  heraldsTunic: {
    con: 6,
    set: 'herald',
  },
  softBlackSuit: {
    con: 7,
    per: 7,
    set: 'blackLoungewear',
  },
  shootingStarCostume: {
    con: 10,
    set: 'shootingStar',
  },
  softVioletSuit: {
    con: 7,
    str: 7,
    set: 'violetLoungewear',
  },
  gardenersOveralls: {
    con: 7,
    set: 'gardenerSet',
  },
  strawRaincoat: {
    con: 9,
    set: 'strawRaincoat',
  },
  fancyPirateSuit: {
    con: 4,
    int: 4,
    set: 'fancyPirate',
  },
  sheetGhostCostume: {
    con: 10,
  },
  jewelersApron: {
    int: 10,
    set: 'jewelers',
  },
  shawlCollarCoat: {
    con: 8,
  },
  teaGown: {
    str: 5,
    int: 5,
    set: 'teaParty',
  },
  basketballUniform: {
    per: 10,
    set: 'oldTimeyBasketball',
  },
  paintersApron: {
    con: 10,
    set: 'painters',
  },
  stripedRainbowShirt: {
    str: 7,
    int: 7,
    set: 'rainbow',
  },
  diagonalRainbowShirt: {
    con: 7,
    per: 7,
    set: 'rainbow',
  },
  admiralsUniform: {
    con: 7,
    str: 7,
    set: 'admiralsSet',
  },
};

const body = {
  cozyScarf: {
    con: 5,
    per: 5,
    set: 'lamplighter',
  },
  lifeguardWhistle: {
    int: 12,
    set: 'lifeguard',
  },
  clownsBowtie: {
    str: 2,
    int: 2,
    con: 2,
    per: 2,
    set: 'clown',
  },
};

const eyewear = {
  plagueDoctorMask: {
    con: 5,
    int: 5,
    set: 'plagueDoctor',
  },
  goofyGlasses: {
    per: 10,
  },
  clownsNose: {
    int: 5,
  },
  tragedyMask: {
    int: 10,
  },
  comedyMask: {
    con: 10,
  },
  jewelersEyeLoupe: {
    per: 10,
    set: 'jewelers',
  },
};

const head = {
  lunarCrown: {
    notes: t('headArmoireLunarCrownNotes', { con: 7, per: 7 }),
    con: 7,
    per: 7,
    set: 'soothing',
  },
  redHairbow: {
    notes: t('headArmoireRedHairbowNotes', { str: 5, int: 5, con: 5 }),
    str: 5,
    int: 5,
    con: 5,
    set: 'redHairbow',
  },
  violetFloppyHat: {
    notes: t('headArmoireVioletFloppyHatNotes', { per: 5, int: 5, con: 5 }),
    per: 5,
    int: 5,
    con: 5,
    set: 'violetLoungewear',
  },
  gladiatorHelm: {
    notes: t('headArmoireGladiatorHelmNotes', { per: 7, int: 7 }),
    per: 7,
    int: 7,
    set: 'gladiator',
  },
  rancherHat: {
    notes: t('headArmoireRancherHatNotes', { str: 5, per: 5, int: 5 }),
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
  },
  royalCrown: {
    str: 10,
    set: 'royal',
  },
  blueHairbow: {
    notes: t('headArmoireBlueHairbowNotes', { per: 5, int: 5, con: 5 }),
    per: 5,
    int: 5,
    con: 5,
    set: 'blueHairbow',
  },
  goldenLaurels: {
    per: 8,
    con: 8,
    set: 'goldenToga',
  },
  hornedIronHelm: {
    con: 9,
    str: 7,
    set: 'hornedIron',
  },
  yellowHairbow: {
    int: 5,
    per: 5,
    str: 5,
    set: 'yellowHairbow',
  },
  redFloppyHat: {
    con: 6,
    int: 6,
    per: 6,
    set: 'redLoungewear',
  },
  plagueDoctorHat: {
    int: 5,
    str: 6,
    con: 5,
    set: 'plagueDoctor',
  },
  blackCat: {
    int: 9,
    per: 9,
  },
  orangeCat: {
    con: 9,
    str: 9,
  },
  blueFloppyHat: {
    per: 7,
    int: 7,
    con: 7,
    set: 'blueLoungewear',
  },
  shepherdHeaddress: {
    int: 9,
    set: 'shepherd',
  },
  crystalCrescentHat: {
    int: 7,
    per: 7,
    set: 'crystalCrescent',
  },
  dragonTamerHelm: {
    int: 15,
    set: 'dragonTamer',
  },
  barristerWig: {
    str: 10,
    set: 'barrister',
  },
  jesterCap: {
    per: 15,
    set: 'jester',
  },
  minerHelmet: {
    int: 5,
    set: 'miner',
  },
  basicArcherCap: {
    per: 6,
    set: 'basicArcher',
  },
  graduateCap: {
    int: 9,
    set: 'graduate',
  },
  greenFloppyHat: {
    per: 8,
    int: 8,
    con: 8,
    set: 'greenLoungewear',
  },
  cannoneerBandanna: {
    int: 15,
    per: 15,
    set: 'cannoneer',
  },
  falconerCap: {
    int: 10,
    set: 'falconer',
  },
  vermilionArcherHelm: {
    per: 12,
    set: 'vermilionArcher',
  },
  ogreMask: {
    con: 7,
    str: 7,
    set: 'ogre',
  },
  ironBlueArcherHelm: {
    con: 9,
    set: 'blueArcher',
  },
  woodElfHelm: {
    con: 12,
    set: 'woodElf',
  },
  ramHeaddress: {
    con: 9,
    per: 7,
    set: 'ramBarbarian',
  },
  crownOfHearts: {
    str: 13,
    set: 'queenOfHearts',
  },
  mushroomDruidCap: {
    int: 6,
    str: 7,
    set: 'mushroomDruid',
  },
  merchantChaperon: {
    int: 7,
    per: 7,
    set: 'merchant',
  },
  vikingHelm: {
    str: 6,
    per: 8,
    set: 'viking',
  },
  swanFeatherCrown: {
    int: 8,
    set: 'swanDancer',
  },
  antiProcrastinationHelm: {
    per: 15,
    set: 'antiProcrastination',
  },
  candlestickMakerHat: {
    int: 6,
    per: 6,
    set: 'candlestickMaker',
  },
  lamplightersTopHat: {
    con: 14,
    set: 'lamplighter',
  },
  coachDriversHat: {
    int: 12,
    set: 'coachDriver',
  },
  crownOfDiamonds: {
    int: 13,
    set: 'kingOfDiamonds',
  },
  flutteryWig: {
    int: 5,
    per: 5,
    str: 5,
    set: 'fluttery',
  },
  bigWig: {
    str: 10,
  },
  paperBag: {
    con: 10,
  },
  birdsNest: {
    int: 10,
  },
  glassblowersHat: {
    per: 8,
    set: 'glassblower',
  },
  piraticalPrincessHeaddress: {
    per: 8,
    int: 8,
    set: 'piraticalPrincess',
  },
  jeweledArcherHelm: {
    int: 15,
    set: 'jeweledArcher',
  },
  veilOfSpades: {
    per: 13,
    set: 'aceOfSpades',
  },
  toqueBlanche: {
    per: 10,
    set: 'chef',
  },
  vernalHennin: {
    per: 12,
    set: 'vernalVestments',
  },
  tricornHat: {
    per: 10,
  },
  nephriteHelm: {
    per: 7,
    int: 6,
    set: 'nephrite',
  },
  boaterHat: {
    str: 6,
    con: 6,
    per: 6,
    set: 'boating',
  },
  astronomersHat: {
    con: 10,
    set: 'astronomer',
  },
  deerstalkerCap: {
    int: 14,
    set: 'detective',
  },
  shadowMastersHood: {
    per: 5,
    con: 5,
    set: 'shadowMaster',
  },
  alchemistsHat: {
    per: 7,
    set: 'alchemist',
  },
  earflapHat: {
    int: 7,
    str: 7,
    set: 'duffle',
  },
  frostedHelm: {
    int: 13,
    set: 'birthday',
  },
  matchMakersBeret: {
    con: 15,
    set: 'matchMaker',
  },
  baseballCap: {
    con: 8,
    str: 8,
    set: 'baseball',
  },
  fiddlersCap: {
    per: 6,
    set: 'fiddler',
  },
  heroicHerbalistCrispinette: {
    int: 9,
    set: 'herbalist',
  },
  guardiansBonnet: {
    con: 8,
    set: 'grazerGuardian',
  },
  hornsOfAutumn: {
    str: 12,
    set: 'autumnEnchanter',
  },
  capOfClubs: {
    int: 10,
    set: 'jackOfClubs',
  },
  nightcap: {
    per: 12,
    set: 'dressingGown',
  },
  blueMoonHelm: {
    int: 8,
    set: 'blueMoon',
  },
  pinkFloppyHat: {
    int: 12,
    set: 'pinkLoungewear',
  },
  jadeHelm: {
    con: 8,
    set: 'jadeWarrior',
  },
  clownsWig: {
    con: 5,
    set: 'clown',
  },
  medievalLaundryCap: {
    int: 6,
    set: 'medievalLaunderers',
  },
  medievalLaundryHat: {
    int: 6,
    set: 'medievalLaunderers',
  },
  rubberDucky: {
    int: 10,
    set: 'bath',
  },
  glengarry: {
    int: 6,
    set: 'bonnieBagpiper',
  },
  heraldsCap: {
    int: 6,
    set: 'herald',
  },
  blackFloppyHat: {
    con: 7,
    per: 7,
    str: 7,
    set: 'blackLoungewear',
  },
  regalCrown: {
    int: 7,
    set: 'regal',
  },
  shootingStarCrown: {
    per: 10,
    set: 'shootingStar',
  },
  gardenersSunHat: {
    per: 7,
    set: 'gardenerSet',
  },
  strawRainHat: {
    per: 9,
    set: 'strawRaincoat',
  },
  fancyPirateHat: {
    per: 8,
    set: 'fancyPirate',
  },
  teaHat: {
    per: 10,
    set: 'teaParty',
  },
  beaniePropellerHat: {
    con: 3,
    per: 3,
    str: 3,
    int: 3,
  },
  paintersBeret: {
    per: 9,
    set: 'painters',
  },
  admiralsBicorne: {
    int: 7,
    per: 7,
    set: 'admiralsSet',
  },
};

const shield = {
  gladiatorShield: {
    notes: t('shieldArmoireGladiatorShieldNotes', { con: 5, str: 5 }),
    con: 5,
    str: 5,
    set: 'gladiator',
  },
  midnightShield: {
    con: 10,
    str: 2,
  },
  royalCane: {
    con: 5,
    int: 5,
    per: 5,
    set: 'royal',
  },
  dragonTamerShield: {
    per: 15,
    set: 'dragonTamer',
  },
  mysticLamp: {
    per: 15,
  },
  floralBouquet: {
    con: 3,
  },
  sandyBucket: {
    per: 10,
    set: 'seaside',
  },
  perchingFalcon: {
    str: 16,
    set: 'falconer',
  },
  ramHornShield: {
    str: 7,
    con: 7,
    set: 'ramBarbarian',
  },
  redRose: {
    per: 10,
  },
  mushroomDruidShield: {
    con: 9,
    str: 8,
    set: 'mushroomDruid',
  },
  festivalParasol: {
    con: 8,
    set: 'festivalAttire',
  },
  vikingShield: {
    per: 6,
    int: 8,
    set: 'viking',
  },
  swanFeatherFan: {
    str: 8,
    set: 'swanDancer',
  },
  goldenBaton: {
    int: 4,
    str: 4,
  },
  antiProcrastinationShield: {
    con: 15,
    set: 'antiProcrastination',
  },
  horseshoe: {
    con: 6,
    per: 6,
    str: 6,
    set: 'farrier',
  },
  handmadeCandlestick: {
    str: 12,
    set: 'candlestickMaker',
  },
  weaversShuttle: {
    per: 9,
    int: 8,
    set: 'weaver',
  },
  shieldOfDiamonds: {
    con: 10,
    set: 'kingOfDiamonds',
  },
  flutteryFan: {
    con: 5,
    int: 5,
    per: 5,
    set: 'fluttery',
  },
  fancyShoe: {
    int: 7,
    per: 7,
    set: 'cobbler',
  },
  fancyBlownGlassVase: {
    int: 6,
    set: 'glassblower',
  },
  piraticalSkullShield: {
    per: 4,
    int: 4,
    set: 'piraticalPrincess',
  },
  unfinishedTome: {
    int: 10,
    set: 'bookbinder',
  },
  softBluePillow: {
    con: 10,
    set: 'blueLoungewear',
  },
  softGreenPillow: {
    con: 8,
    int: 6,
    set: 'greenLoungewear',
  },
  softRedPillow: {
    con: 5,
    str: 5,
    set: 'redLoungewear',
  },
  mightyQuill: {
    per: 9,
    set: 'scribe',
  },
  mightyPizza: {
    per: 8,
    set: 'chef',
  },
  trustyUmbrella: {
    int: 7,
    set: 'detective',
  },
  polishedPocketwatch: {
    int: 9,
  },
  masteredShadow: {
    per: 5,
    con: 5,
    set: 'shadowMaster',
  },
  alchemistsScale: {
    int: 7,
    set: 'alchemist',
  },
  birthdayBanner: {
    str: 7,
    set: 'birthday',
  },
  perfectMatch: {
    per: 15,
    set: 'matchMaker',
  },
  baseballGlove: {
    str: 9,
    set: 'baseball',
  },
  hobbyHorse: {
    per: 4,
    con: 4,
    set: 'paperKnight',
  },
  fiddle: {
    int: 6,
    set: 'fiddler',
  },
  lifeBuoy: {
    con: 12,
    set: 'lifeguard',
  },
  piratesCompanion: {
    per: 8,
    set: 'pirate',
  },
  mortarAndPestle: {
    con: 9,
    set: 'herbalist',
  },
  darkAutumnFlame: {
    con: 12,
    set: 'autumnEnchanter',
  },
  blueMoonSai: {
    per: 8,
    set: 'blueMoon',
  },
  softPinkPillow: {
    str: 6,
    con: 6,
    set: 'pinkLoungewear',
  },
  clownsBalloons: {
    per: 5,
    set: 'clown',
  },
  strawberryFood: {
    str: 5,
    set: 'petFood',
  },
  rottenMeatFood: {
    con: 5,
    set: 'petFood',
  },
  potatoFood: {
    per: 5,
    set: 'petFood',
  },
  pinkCottonCandyFood: {
    int: 5,
    set: 'petFood',
  },
  meatFood: {
    str: 5,
    set: 'petFood',
  },
  honeyFood: {
    int: 3,
    per: 3,
    set: 'petFood',
  },
  fishFood: {
    per: 5,
    set: 'petFood',
  },
  chocolateFood: {
    int: 5,
    set: 'petFood',
  },
  blueCottonCandyFood: {
    con: 5,
    set: 'petFood',
  },
  milkFood: {
    con: 3,
    str: 3,
    set: 'petFood',
  },
  medievalLaundry: {
    per: 6,
    set: 'medievalLaunderers',
  },
  bouncyBubbles: {
    str: 5,
    set: 'bath',
  },
  bagpipes: {
    str: 6,
    set: 'bonnieBagpiper',
  },
  heraldsMessageScroll: {
    per: 6,
    set: 'herald',
  },
  softBlackPillow: {
    int: 5,
    per: 5,
    set: 'blackLoungewear',
  },
  softVioletPillow: {
    int: 10,
    set: 'violetLoungewear',
  },
  gardenersSpade: {
    str: 8,
    set: 'gardenerSet',
  },
  spanishGuitar: {
    per: 5, // this might need to go back to 6
    int: 6,
    set: 'musicalInstrumentOne',
  },
  snareDrum: {
    con: 5,
    int: 6,
    set: 'musicalInstrumentOne',
  },
  treasureMap: {
    int: 4,
    str: 4,
    set: 'fancyPirate',
  },
  dustpan: {
    int: 4,
    con: 4,
    set: 'cleaningSupplies',
  },
  bubblingCauldron: {
    con: 8,
    set: 'cookingImplements',
  },
  jewelersPliers: {
    str: 10,
    set: 'jewelers',
  },
  teaKettle: {
    con: 10,
    set: 'teaParty',
  },
  basketball: {
    con: 5,
    str: 5,
    set: 'oldTimeyBasketball',
  },
  paintersPalette: {
    str: 7,
    set: 'painters',
  },
};

const headAccessory = {
  comicalArrow: {
    str: 10,
  },
  gogglesOfBookbinding: {
    per: 8,
    set: 'bookbinder',
  },
};

const weapon = {
  basicCrossbow: {
    notes: t('weaponArmoireBasicCrossbowNotes', { str: 5, per: 5, con: 5 }),
    str: 5,
    per: 5,
    con: 5,
  },
  lunarSceptre: {
    notes: t('weaponArmoireLunarSceptreNotes', { con: 7, int: 7 }),
    con: 7,
    int: 7,
    set: 'soothing',
  },
  rancherLasso: {
    twoHanded: true,
    notes: t('weaponArmoireRancherLassoNotes', { str: 5, per: 5, int: 5 }),
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
  },
  mythmakerSword: {
    str: 6,
    per: 6,
    set: 'goldenToga',
  },
  ironCrook: {
    str: 7,
    per: 7,
    set: 'hornedIron',
  },
  goldWingStaff: {
    con: 4,
    int: 4,
    per: 4,
    str: 4,
  },
  batWand: {
    int: 10,
    per: 2,
  },
  shepherdsCrook: {
    con: 9,
    set: 'shepherd',
  },
  crystalCrescentStaff: {
    int: 7,
    str: 7,
    set: 'crystalCrescent',
  },
  blueLongbow: {
    per: 9,
    con: 8,
    str: 7,
    twoHanded: true,
    set: 'blueArcher',
  },
  glowingSpear: {
    str: 15,
  },
  barristerGavel: {
    str: 5,
    con: 5,
    set: 'barrister',
  },
  jesterBaton: {
    int: 8,
    per: 8,
    set: 'jester',
  },
  miningPickax: {
    per: 15,
    set: 'miner',
  },
  basicLongbow: {
    str: 6,
    twoHanded: true,
    set: 'basicArcher',
  },
  habiticanDiploma: {
    int: 11,
    set: 'graduate',
  },
  sandySpade: {
    str: 10,
    set: 'seaside',
  },
  cannon: {
    str: 15,
    set: 'cannoneer',
  },
  vermilionArcherBow: {
    str: 15,
    twoHanded: true,
    set: 'vermilionArcher',
  },
  ogreClub: {
    str: 15,
    set: 'ogre',
  },
  woodElfStaff: {
    int: 12,
    set: 'woodElf',
  },
  wandOfHearts: {
    int: 13,
    set: 'queenOfHearts',
  },
  forestFungusStaff: {
    int: 8,
    per: 9,
  },
  festivalFirecracker: {
    per: 8,
    set: 'festivalAttire',
  },
  merchantsDisplayTray: {
    int: 10,
    set: 'merchant',
  },
  battleAxe: {
    int: 6,
    con: 8,
  },
  hoofClippers: {
    con: 6,
    int: 6,
    str: 6,
    set: 'farrier',
  },
  weaversComb: {
    per: 8,
    str: 9,
    set: 'weaver',
  },
  lamplighter: {
    per: 6,
    con: 8,
    set: 'lamplighter',
  },
  coachDriversWhip: {
    str: 6,
    int: 8,
    set: 'coachDriver',
  },
  scepterOfDiamonds: {
    str: 13,
    set: 'kingOfDiamonds',
  },
  flutteryArmy: {
    con: 5,
    int: 5,
    str: 5,
    set: 'fluttery',
  },
  cobblersHammer: {
    con: 7,
    str: 7,
    set: 'cobbler',
  },
  glassblowersBlowpipe: {
    str: 6,
    set: 'glassblower',
  },
  poisonedGoblet: {
    int: 7,
    set: 'piraticalPrincess',
  },
  jeweledArcherBow: {
    twoHanded: true,
    int: 15,
    set: 'jeweledArcher',
  },
  needleOfBookbinding: {
    str: 8,
    set: 'bookbinder',
  },
  spearOfSpades: {
    con: 13,
    set: 'aceOfSpades',
  },
  arcaneScroll: {
    int: 9,
    set: 'scribe',
  },
  chefsSpoon: {
    int: 8,
    set: 'chef',
  },
  vernalTaper: {
    con: 8,
    set: 'vernalVestments',
  },
  jugglingBalls: {
    int: 10,
  },
  slingshot: {
    str: 10,
  },
  nephriteBow: {
    int: 7,
    str: 6,
    set: 'nephrite',
    twoHanded: true,
  },
  bambooCane: {
    int: 6,
    per: 6,
    con: 6,
    set: 'boating',
  },
  astronomersTelescope: {
    per: 10,
    set: 'astronomer',
  },
  magnifyingGlass: {
    per: 7,
    set: 'detective',
  },
  floridFan: {
    con: 9,
  },
  resplendentRapier: {
    per: 9,
  },
  shadowMastersMace: {
    per: 12,
    set: 'shadowMaster',
  },
  alchemistsDistiller: {
    str: 8,
    int: 5,
    set: 'alchemist',
  },
  happyBanner: {
    per: 7,
    set: 'birthday',
  },
  livelyMatch: {
    str: 15,
    set: 'matchMaker',
  },
  baseballBat: {
    con: 9,
    set: 'baseball',
  },
  paperCutter: {
    str: 9,
    set: 'paperKnight',
  },
  fiddlersBow: {
    str: 6,
    set: 'fiddler',
  },
  beachFlag: {
    per: 12,
    set: 'lifeguard',
  },
  handyHook: {
    str: 8,
    set: 'pirate',
  },
  guardiansCrook: {
    str: 10,
    set: 'grazerGuardian',
  },
  enchantersStaff: {
    per: 12,
    set: 'autumnEnchanter',
  },
  clubOfClubs: {
    str: 10,
    set: 'jackOfClubs',
  },
  eveningTea: {
    int: 12,
    set: 'dressingGown',
  },
  blueMoonSai: {
    str: 8,
    set: 'blueMoon',
  },
  jadeGlaive: {
    str: 10,
    set: 'jadeWarrior',
  },
  medievalWashboard: {
    str: 6,
    set: 'medievalLaunderers',
  },
  buoyantBubbles: {
    per: 5,
    set: 'bath',
  },
  heraldsBuisine: {
    str: 6,
    set: 'herald',
  },
  skullLantern: {
    int: 10,
  },
  potionBase: {
    str: 3,
    int: 3,
    con: 3,
    per: 3,
    set: 'hatchingPotions',
  },
  potionBlue: {
    int: 4,
    con: 8,
    set: 'hatchingPotions',
  },
  potionDesert: {
    str: 4,
    con: 8,
    set: 'hatchingPotions',
  },
  potionGolden: {
    str: 6,
    int: 6,
    set: 'hatchingPotions',
  },
  potionPink: {
    int: 4,
    con: 8,
    set: 'hatchingPotions',
  },
  potionRed: {
    str: 6,
    con: 6,
    set: 'hatchingPotions',
  },
  potionShade: {
    int: 9,
    per: 3,
    set: 'hatchingPotions',
  },
  potionSkeleton: {
    str: 9,
    int: 3,
    set: 'hatchingPotions',
  },
  potionWhite: {
    con: 5,
    per: 7,
    set: 'hatchingPotions',
  },
  potionZombie: {
    con: 4,
    per: 8,
    set: 'hatchingPotions',
  },
  regalSceptre: {
    per: 7,
    set: 'regal',
  },
  shootingStarSpell: {
    str: 5,
    int: 5,
    set: 'shootingStar',
    twoHanded: true,
  },
  pinkLongbow: {
    per: 6,
    str: 5,
    twoHanded: true,
  },
  gardenersWateringCan: {
    int: 8,
    set: 'gardenerSet',
  },
  huntingHorn: {
    str: 5,
    int: 6,
    set: 'musicalInstrumentOne',
  },
  blueKite: {
    str: 3,
    con: 3,
    int: 3,
    per: 3,
    set: 'kite',
  },
  greenKite: {
    str: 3,
    con: 3,
    int: 3,
    per: 3,
    set: 'kite',
  },
  orangeKite: {
    str: 3,
    con: 3,
    int: 3,
    per: 3,
    set: 'kite',
  },
  pinkKite: {
    str: 3,
    con: 3,
    int: 3,
    per: 3,
    set: 'kite',
  },
  yellowKite: {
    str: 3,
    con: 3,
    int: 3,
    per: 3,
    set: 'kite',
  },
  pushBroom: {
    str: 4,
    int: 4,
    set: 'cleaningSupplies',
  },
  featherDuster: {
    con: 4,
    per: 4,
    set: 'cleaningSupplies',
  },
  magicSpatula: {
    per: 8,
    set: 'cookingImplements',
  },
  finelyCutGem: {
    con: 10,
    set: 'jewelers',
  },
  paintbrush: {
    int: 8,
    set: 'painters',
  },
};

forEach({
  armor,
  body,
  eyewear,
  head,
  headAccessory,
  shield,
  weapon,
}, (set, setKey) => {
  forEach(set, (gearItem, gearKey) => {
    const gearStats = {};
    const gearStatValues = [];
    let notes;
    if (!gearItem.notes) {
      forEach(ATTRIBUTES, stat => {
        if (gearItem[stat]) {
          gearStats[stat] = gearItem[stat];
          gearStatValues.push(gearItem[stat]);
        }
      });
    }
    if (gearStatValues.length > 0) {
      if (gearStatValues.length === 1
        || find(gearStats, gearStat => gearStat !== gearStatValues[0])
      ) {
        notes = t(`${setKey}Armoire${upperFirst(gearKey)}Notes`, gearStats);
      } else {
        notes = t(`${setKey}Armoire${upperFirst(gearKey)}Notes`, { attrs: gearStatValues[0] });
      }
    } else {
      notes = t(`${setKey}Armoire${upperFirst(gearKey)}Notes`);
    }
    defaults(gearItem, {
      canOwn: ownsItem(`${setKey}_armoire_${gearKey}`),
      notes,
      text: t(`${setKey}Armoire${upperFirst(gearKey)}Text`),
      value: 100,
    });
  });
});

export {
  armor,
  body,
  eyewear,
  head,
  headAccessory,
  shield,
  weapon,
};
