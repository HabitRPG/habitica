import defaults from 'lodash/defaults';
import forEach from 'lodash/forEach';
import upperFirst from 'lodash/upperFirst';
import { ownsItem } from '../gear-helper';
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
    notes: t('armorArmoireGoldenTogaNotes', { attrs: 8 }),
    str: 8,
    con: 8,
    set: 'goldenToga',
  },
  hornedIronArmor: {
    notes: t('armorArmoireHornedIronArmorNotes', { con: 9, per: 7 }),
    con: 9,
    per: 7,
    set: 'hornedIron',
  },
  plagueDoctorOvercoat: {
    notes: t('armorArmoirePlagueDoctorOvercoatNotes', { int: 6, str: 5, con: 6 }),
    int: 6,
    str: 5,
    con: 6,
    set: 'plagueDoctor',
  },
  shepherdRobes: {
    notes: t('armorArmoireShepherdRobesNotes', { attrs: 9 }),
    str: 9,
    per: 9,
    set: 'shepherd',
  },
  royalRobes: {
    notes: t('armorArmoireRoyalRobesNotes', { attrs: 5 }),
    con: 5,
    per: 5,
    int: 5,
    set: 'royal',
  },
  crystalCrescentRobes: {
    notes: t('armorArmoireCrystalCrescentRobesNotes', { attrs: 7 }),
    per: 7,
    con: 7,
    set: 'crystalCrescent',
  },
  dragonTamerArmor: {
    notes: t('armorArmoireDragonTamerArmorNotes', { con: 15 }),
    con: 15,
    set: 'dragonTamer',
  },
  barristerRobes: {
    notes: t('armorArmoireBarristerRobesNotes', { con: 10 }),
    con: 10,
    set: 'barrister',
  },
  jesterCostume: {
    notes: t('armorArmoireJesterCostumeNotes', { int: 15 }),
    int: 15,
    set: 'jester',
  },
  minerOveralls: {
    notes: t('armorArmoireMinerOverallsNotes', { con: 10 }),
    con: 10,
    set: 'miner',
  },
  basicArcherArmor: {
    notes: t('armorArmoireBasicArcherArmorNotes', { per: 12 }),
    per: 12,
    set: 'basicArcher',
  },
  graduateRobe: {
    notes: t('armorArmoireGraduateRobeNotes', { int: 10 }),
    int: 10,
    set: 'graduate',
  },
  stripedSwimsuit: {
    notes: t('armorArmoireStripedSwimsuitNotes', { con: 13 }),
    con: 13,
    set: 'seaside',
  },
  cannoneerRags: {
    notes: t('armorArmoireCannoneerRagsNotes', { con: 15 }),
    con: 15,
    set: 'cannoneer',
  },
  falconerArmor: {
    notes: t('armorArmoireFalconerArmorNotes', { con: 10 }),
    con: 10,
    set: 'falconer',
  },
  vermilionArcherArmor: {
    notes: t('armorArmoireVermilionArcherArmorNotes', { per: 15 }),
    per: 15,
    set: 'vermilionArcher',
  },
  ogreArmor: {
    notes: t('armorArmoireOgreArmorNotes', { con: 15 }),
    con: 15,
    set: 'ogre',
  },
  ironBlueArcherArmor: {
    notes: t('armorArmoireIronBlueArcherArmorNotes', { str: 12 }),
    str: 12,
    set: 'blueArcher',
  },
  redPartyDress: {
    notes: t('armorArmoireRedPartyDressNotes', { attrs: 7 }),
    str: 7,
    con: 7,
    int: 7,
    set: 'redHairbow',
  },
  woodElfArmor: {
    notes: t('armorArmoireWoodElfArmorNotes', { per: 12 }),
    per: 12,
    set: 'woodElf',
  },
  ramFleeceRobes: {
    notes: t('armorArmoireRamFleeceRobesNotes', { con: 9, str: 7 }),
    con: 9,
    str: 7,
    set: 'ramBarbarian',
  },
  gownOfHearts: {
    notes: t('armorArmoireGownOfHeartsNotes', { con: 13 }),
    con: 13,
    set: 'queenOfHearts',
  },
  mushroomDruidArmor: {
    notes: t('armorArmoireMushroomDruidArmorNotes', { con: 7, per: 8 }),
    con: 7,
    per: 8,
    set: 'mushroomDruid',
  },
  greenFestivalYukata: {
    notes: t('armorArmoireGreenFestivalYukataNotes', { attrs: 8 }),
    con: 8,
    per: 8,
    set: 'festivalAttire',
  },
  merchantTunic: {
    notes: t('armorArmoireMerchantTunicNotes', { per: 10 }),
    per: 10,
    set: 'merchant',
  },
  vikingTunic: {
    notes: t('armorArmoireVikingTunicNotes', { con: 6, str: 8 }),
    con: 6,
    str: 8,
    set: 'viking',
  },
  swanDancerTutu: {
    notes: t('armorArmoireSwanDancerTutuNotes', { attrs: 8 }),
    int: 8,
    str: 8,
    set: 'swanDancer',
  },
  yellowPartyDress: {
    notes: t('armorArmoireYellowPartyDressNotes', { attrs: 7 }),
    per: 7,
    int: 7,
    str: 7,
    set: 'yellowHairbow',
  },
  antiProcrastinationArmor: {
    notes: t('armorArmoireAntiProcrastinationArmorNotes', { str: 15 }),
    str: 15,
    set: 'antiProcrastination',
  },
  farrierOutfit: {
    notes: t('armorArmoireFarrierOutfitNotes', { attrs: 6 }),
    con: 6,
    int: 6,
    per: 6,
    set: 'farrier',
  },
  candlestickMakerOutfit: {
    notes: t('armorArmoireCandlestickMakerOutfitNotes', { con: 12 }),
    con: 12,
    set: 'candlestickMaker',
  },
  wovenRobes: {
    notes: t('armorArmoireWovenRobesNotes', { con: 8, int: 9 }),
    con: 8,
    int: 9,
    set: 'weaver',
  },
  lamplightersGreatcoat: {
    notes: t('armorArmoireLamplightersGreatcoatNotes', { per: 14 }),
    per: 14,
    set: 'lamplighter',
  },
  coachDriverLivery: {
    notes: t('armorArmoireCoachDriverLiveryNotes', { str: 12 }),
    str: 12,
    set: 'coachDriver',
  },
  robeOfDiamonds: {
    notes: t('armorArmoireRobeOfDiamondsNotes', { per: 13 }),
    per: 13,
    set: 'kingOfDiamonds',
  },
  flutteryFrock: {
    notes: t('armorArmoireFlutteryFrockNotes', { attrs: 5 }),
    con: 5,
    per: 5,
    str: 5,
    set: 'fluttery',
  },
  cobblersCoveralls: {
    notes: t('armorArmoireCobblersCoverallsNotes', { attrs: 7 }),
    per: 7,
    str: 7,
    set: 'cobbler',
  },
  glassblowersCoveralls: {
    notes: t('armorArmoireGlassblowersCoverallsNotes', { con: 8 }),
    con: 8,
    set: 'glassblower',
  },
  bluePartyDress: {
    notes: t('armorArmoireBluePartyDressNotes', { attrs: 7 }),
    con: 7,
    per: 7,
    str: 7,
    set: 'blueHairbow',
  },
  piraticalPrincessGown: {
    notes: t('armorArmoirePiraticalPrincessGownNotes', { per: 7 }),
    per: 7,
    set: 'piraticalPrincess',
  },
  jeweledArcherArmor: {
    notes: t('armorArmoireJeweledArcherArmorNotes', { con: 15 }),
    con: 15,
    set: 'jeweledArcher',
  },
  coverallsOfBookbinding: {
    notes: t('armorArmoireCoverallsOfBookbindingNotes', { con: 10, per: 5 }),
    con: 10,
    per: 5,
    set: 'bookbinder',
  },
  robeOfSpades: {
    notes: t('armorArmoireRobeOfSpadesNotes', { str: 13 }),
    str: 13,
    set: 'aceOfSpades',
  },
  softBlueSuit: {
    notes: t('armorArmoireSoftBlueSuitNotes', { int: 10, per: 5 }),
    int: 10,
    per: 5,
    set: 'blueLoungewear',
  },
  softGreenSuit: {
    notes: t('armorArmoireSoftGreenSuitNotes', { attrs: 7 }),
    int: 7,
    con: 7,
    set: 'greenLoungewear',
  },
  softRedSuit: {
    notes: t('armorArmoireSoftRedSuitNotes', { int: 8, str: 5 }),
    int: 8,
    str: 5,
    set: 'redLoungewear',
  },
  scribesRobe: {
    notes: t('armorArmoireScribesRobeNotes', { attrs: 7 }),
    int: 7,
    per: 7,
    set: 'scribe',
  },
  chefsJacket: {
    notes: t('armorArmoireChefsJacketNotes', { int: 10 }),
    int: 10,
    set: 'chef',
  },
  vernalVestment: {
    notes: t('armorArmoireVernalVestmentNotes', { attrs: 6 }),
    str: 6,
    int: 6,
    set: 'vernalVestments',
  },
  nephriteArmor: {
    notes: t('armorArmoireNephriteArmorNotes', { str: 7, per: 6 }),
    str: 7,
    per: 6,
    set: 'nephrite',
  },
  boatingJacket: {
    notes: t('armorArmoireBoatingJacketNotes', { attrs: 6 }),
    int: 6,
    per: 6,
    str: 6,
    set: 'boating',
  },
  astronomersRobe: {
    notes: t('armorArmoireAstronomersRobeNotes', { attrs: 8 }),
    per: 8,
    con: 8,
    set: 'astronomer',
  },
  invernessCape: {
    notes: t('armorArmoireInvernessCapeNotes', { attrs: 7 }),
    per: 7,
    int: 7,
    set: 'detective',
  },
  shadowMastersRobe: {
    notes: t('armorArmoireShadowMastersRobeNotes', { con: 12 }),
    con: 12,
    set: 'shadowMaster',
  },
  alchemistsRobe: {
    notes: t('armorArmoireAlchemistsRobeNotes', { con: 8, per: 5 }),
    con: 8,
    per: 5,
    set: 'alchemist',
  },
  duffleCoat: {
    notes: t('armorArmoireDuffleCoatNotes', { attrs: 7 }),
    con: 7,
    per: 7,
    set: 'duffle',
  },
  layerCakeArmor: {
    notes: t('armorArmoireLayerCakeArmorNotes', { con: 13 }),
    con: 13,
    set: 'birthday',
  },
  matchMakersApron: {
    notes: t('armorArmoireMatchMakersApronNotes', { attrs: 7 }),
    con: 7,
    str: 7,
    int: 7,
    set: 'matchMaker',
  },
  baseballUniform: {
    notes: t('armorArmoireBaseballUniformNotes', { attrs: 10 }),
    con: 10,
    str: 10,
    set: 'baseball',
  },
  boxArmor: {
    notes: t('armorArmoireBoxArmorNotes', { attrs: 5 }),
    per: 5,
    con: 5,
    set: 'paperKnight',
  },
  fiddlersCoat: {
    notes: t('armorArmoireFiddlersCoatNotes', { con: 6 }),
    con: 6,
    set: 'fiddler',
  },
};

const body = {
  cozyScarf: {
    notes: t('bodyArmoireCozyScarfNotes', { attrs: 5 }),
    con: 5,
    per: 5,
    set: 'lamplighter',
  },
  lifeguardWhistle: {
    notes: t('bodyArmoireLifeguardWhistleNotes', { int: 12 }),
    int: 12,
    set: 'lifeguard',
  },
};

const eyewear = {
  plagueDoctorMask: {
    notes: t('eyewearArmoirePlagueDoctorMaskNotes', { attrs: 5 }),
    con: 5,
    int: 5,
    set: 'plagueDoctor',
  },
  goofyGlasses: {
    notes: t('eyewearArmoireGoofyGlassesNotes', { per: 10 }),
    per: 10,
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
    notes: t('headArmoireRoyalCrownNotes', { str: 10 }),
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
    notes: t('headArmoireGoldenLaurelsNotes', { attrs: 8 }),
    per: 8,
    con: 8,
    set: 'goldenToga',
  },
  hornedIronHelm: {
    notes: t('headArmoireHornedIronHelmNotes', { con: 9, str: 7 }),
    con: 9,
    str: 7,
    set: 'hornedIron',
  },
  yellowHairbow: {
    notes: t('headArmoireYellowHairbowNotes', { attrs: 5 }),
    int: 5,
    per: 5,
    str: 5,
    set: 'yellowHairbow',
  },
  redFloppyHat: {
    notes: t('headArmoireRedFloppyHatNotes', { attrs: 6 }),
    con: 6,
    int: 6,
    per: 6,
    set: 'redLoungewear',
  },
  plagueDoctorHat: {
    notes: t('headArmoirePlagueDoctorHatNotes', { int: 5, str: 6, con: 5 }),
    int: 5,
    str: 6,
    con: 5,
    set: 'plagueDoctor',
  },
  blackCat: {
    notes: t('headArmoireBlackCatNotes', { attrs: 9 }),
    int: 9,
    per: 9,
  },
  orangeCat: {
    notes: t('headArmoireOrangeCatNotes', { attrs: 9 }),
    con: 9,
    str: 9,
  },
  blueFloppyHat: {
    notes: t('headArmoireBlueFloppyHatNotes', { attrs: 7 }),
    per: 7,
    int: 7,
    con: 7,
    set: 'blueLoungewear',
  },
  shepherdHeaddress: {
    notes: t('headArmoireShepherdHeaddressNotes', { int: 9 }),
    int: 9,
    set: 'shepherd',
  },
  crystalCrescentHat: {
    notes: t('headArmoireCrystalCrescentHatNotes', { attrs: 7 }),
    int: 7,
    per: 7,
    set: 'crystalCrescent',
  },
  dragonTamerHelm: {
    notes: t('headArmoireDragonTamerHelmNotes', { int: 15 }),
    int: 15,
    set: 'dragonTamer',
  },
  barristerWig: {
    notes: t('headArmoireBarristerWigNotes', { str: 10 }),
    str: 10,
    set: 'barrister',
  },
  jesterCap: {
    notes: t('headArmoireJesterCapNotes', { per: 15 }),
    per: 15,
    set: 'jester',
  },
  minerHelmet: {
    notes: t('headArmoireMinerHelmetNotes', { int: 5 }),
    int: 5,
    set: 'miner',
  },
  basicArcherCap: {
    notes: t('headArmoireBasicArcherCapNotes', { per: 6 }),
    per: 6,
    set: 'basicArcher',
  },
  graduateCap: {
    notes: t('headArmoireGraduateCapNotes', { int: 9 }),
    int: 9,
    set: 'graduate',
  },
  greenFloppyHat: {
    notes: t('headArmoireGreenFloppyHatNotes', { attrs: 8 }),
    per: 8,
    int: 8,
    con: 8,
    set: 'greenLoungewear',
  },
  cannoneerBandanna: {
    notes: t('headArmoireCannoneerBandannaNotes', { attrs: 15 }),
    int: 15,
    per: 15,
    set: 'cannoneer',
  },
  falconerCap: {
    notes: t('headArmoireFalconerCapNotes', { int: 10 }),
    int: 10,
    set: 'falconer',
  },
  vermilionArcherHelm: {
    notes: t('headArmoireVermilionArcherHelmNotes', { per: 12 }),
    per: 12,
    set: 'vermilionArcher',
  },
  ogreMask: {
    notes: t('headArmoireOgreMaskNotes', { attrs: 7 }),
    con: 7,
    str: 7,
    set: 'ogre',
  },
  ironBlueArcherHelm: {
    notes: t('headArmoireIronBlueArcherHelmNotes', { con: 9 }),
    con: 9,
    set: 'blueArcher',
  },
  woodElfHelm: {
    notes: t('headArmoireWoodElfHelmNotes', { con: 12 }),
    con: 12,
    set: 'woodElf',
  },
  ramHeaddress: {
    notes: t('headArmoireRamHeaddressNotes', { con: 9, per: 7 }),
    con: 9,
    per: 7,
    set: 'ramBarbarian',
  },
  crownOfHearts: {
    notes: t('headArmoireCrownOfHeartsNotes', { str: 13 }),
    str: 13,
    set: 'queenOfHearts',
  },
  mushroomDruidCap: {
    notes: t('headArmoireMushroomDruidCapNotes', { int: 6, str: 7 }),
    int: 6,
    str: 7,
    set: 'mushroomDruid',
  },
  merchantChaperon: {
    notes: t('headArmoireMerchantChaperonNotes', { attrs: 7 }),
    int: 7,
    per: 7,
    set: 'merchant',
  },
  vikingHelm: {
    notes: t('headArmoireVikingHelmNotes', { str: 6, per: 8 }),
    str: 6,
    per: 8,
    set: 'viking',
  },
  swanFeatherCrown: {
    notes: t('headArmoireSwanFeatherCrownNotes', { int: 8 }),
    int: 8,
    set: 'swanDancer',
  },
  antiProcrastinationHelm: {
    notes: t('headArmoireAntiProcrastinationHelmNotes', { per: 15 }),
    per: 15,
    set: 'antiProcrastination',
  },
  candlestickMakerHat: {
    notes: t('headArmoireCandlestickMakerHatNotes', { attrs: 6 }),
    int: 6,
    per: 6,
    set: 'candlestickMaker',
  },
  lamplightersTopHat: {
    notes: t('headArmoireLamplightersTopHatNotes', { con: 14 }),
    con: 14,
    set: 'lamplighter',
  },
  coachDriversHat: {
    notes: t('headArmoireCoachDriversHatNotes', { int: 12 }),
    int: 12,
    set: 'coachDriver',
  },
  crownOfDiamonds: {
    notes: t('headArmoireCrownOfDiamondsNotes', { int: 13 }),
    int: 13,
    set: 'kingOfDiamonds',
  },
  flutteryWig: {
    notes: t('headArmoireFlutteryWigNotes', { attrs: 5 }),
    int: 5,
    per: 5,
    str: 5,
    set: 'fluttery',
  },
  bigWig: {
    notes: t('headArmoireBigWigNotes', { str: 10 }),
    str: 10,
  },
  paperBag: {
    notes: t('headArmoirePaperBagNotes', { con: 10 }),
    con: 10,
  },
  birdsNest: {
    notes: t('headArmoireBirdsNestNotes', { int: 10 }),
    int: 10,
  },
  glassblowersHat: {
    notes: t('headArmoireGlassblowersHatNotes', { per: 8 }),
    per: 8,
    set: 'glassblower',
  },
  piraticalPrincessHeaddress: {
    notes: t('headArmoirePiraticalPrincessHeaddressNotes', { attrs: 8 }),
    per: 8,
    int: 8,
    set: 'piraticalPrincess',
  },
  jeweledArcherHelm: {
    notes: t('headArmoireJeweledArcherHelmNotes', { int: 15 }),
    int: 15,
    set: 'jeweledArcher',
  },
  veilOfSpades: {
    notes: t('headArmoireVeilOfSpadesNotes', { per: 13 }),
    per: 13,
    set: 'aceOfSpades',
  },
  toqueBlanche: {
    notes: t('headArmoireToqueBlancheNotes', { per: 10 }),
    per: 10,
    set: 'chef',
  },
  vernalHennin: {
    notes: t('headArmoireVernalHenninNotes', { per: 12 }),
    per: 12,
    set: 'vernalVestments',
  },
  tricornHat: {
    notes: t('headArmoireTricornHatNotes', { per: 10 }),
    per: 10,
  },
  nephriteHelm: {
    notes: t('headArmoireNephriteHelmNotes', { per: 7, int: 6 }),
    per: 7,
    int: 6,
    set: 'nephrite',
  },
  boaterHat: {
    notes: t('headArmoireBoaterHatNotes', { attrs: 6 }),
    str: 6,
    con: 6,
    per: 6,
    set: 'boating',
  },
  astronomersHat: {
    notes: t('headArmoireAstronomersHatNotes', { con: 10 }),
    con: 10,
    set: 'astronomer',
  },
  deerstalkerCap: {
    notes: t('headArmoireDeerstalkerCapNotes', { int: 14 }),
    int: 14,
    set: 'detective',
  },
  shadowMastersHood: {
    notes: t('headArmoireShadowMastersHoodNotes', { attrs: 5 }),
    per: 5,
    con: 5,
    set: 'shadowMaster',
  },
  alchemistsHat: {
    notes: t('headArmoireAlchemistsHatNotes', { per: 7 }),
    per: 7,
    set: 'alchemist',
  },
  earflapHat: {
    notes: t('headArmoireEarflapHatNotes', { attrs: 7 }),
    int: 7,
    str: 7,
    set: 'duffle',
  },
  frostedHelm: {
    notes: t('headArmoireFrostedHelmNotes', { int: 13 }),
    int: 13,
    set: 'birthday',
  },
  matchMakersBeret: {
    notes: t('headArmoireMatchMakersBeretNotes', { con: 15 }),
    con: 15,
    set: 'matchMaker',
  },
  baseballCap: {
    notes: t('headArmoireBaseballCapNotes', { attrs: 8 }),
    con: 8,
    str: 8,
    set: 'baseball',
  },
  fiddlersCap: {
    notes: t('headArmoireFiddlersCapNotes', { per: 6 }),
    per: 6,
    set: 'fiddler',
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
    notes: t('shieldArmoireMidnightShieldNotes', { con: 10, str: 2 }),
    con: 10,
    str: 2,
  },
  royalCane: {
    notes: t('shieldArmoireRoyalCaneNotes', { attrs: 5 }),
    con: 5,
    int: 5,
    per: 5,
    set: 'royal',
  },
  dragonTamerShield: {
    notes: t('shieldArmoireDragonTamerShieldNotes', { per: 15 }),
    per: 15,
    set: 'dragonTamer',
  },
  mysticLamp: {
    notes: t('shieldArmoireMysticLampNotes', { per: 15 }),
    per: 15,
  },
  floralBouquet: {
    notes: t('shieldArmoireFloralBouquetNotes', { con: 3 }),
    con: 3,
  },
  sandyBucket: {
    notes: t('shieldArmoireSandyBucketNotes', { per: 10 }),
    per: 10,
    set: 'seaside',
  },
  perchingFalcon: {
    notes: t('shieldArmoirePerchingFalconNotes', { str: 16 }),
    str: 16,
    set: 'falconer',
  },
  ramHornShield: {
    notes: t('shieldArmoireRamHornShieldNotes', { attrs: 7 }),
    str: 7,
    con: 7,
    set: 'ramBarbarian',
  },
  redRose: {
    notes: t('shieldArmoireRedRoseNotes', { per: 10 }),
    per: 10,
  },
  mushroomDruidShield: {
    notes: t('shieldArmoireMushroomDruidShieldNotes', { con: 9, str: 8 }),
    con: 9,
    str: 8,
    set: 'mushroomDruid',
  },
  festivalParasol: {
    notes: t('shieldArmoireFestivalParasolNotes', { con: 8 }),
    con: 8,
    set: 'festivalAttire',
  },
  vikingShield: {
    notes: t('shieldArmoireVikingShieldNotes', { per: 6, int: 8 }),
    per: 6,
    int: 8,
    set: 'viking',
  },
  swanFeatherFan: {
    notes: t('shieldArmoireSwanFeatherFanNotes', { str: 8 }),
    str: 8,
    set: 'swanDancer',
  },
  goldenBaton: {
    notes: t('shieldArmoireGoldenBatonNotes', { attrs: 4 }),
    int: 4,
    str: 4,
  },
  antiProcrastinationShield: {
    notes: t('shieldArmoireAntiProcrastinationShieldNotes', { con: 15 }),
    con: 15,
    set: 'antiProcrastination',
  },
  horseshoe: {
    notes: t('shieldArmoireHorseshoeNotes', { attrs: 6 }),
    con: 6,
    per: 6,
    str: 6,
    set: 'farrier',
  },
  handmadeCandlestick: {
    notes: t('shieldArmoireHandmadeCandlestickNotes', { str: 12 }),
    str: 12,
    set: 'candlestickMaker',
  },
  weaversShuttle: {
    notes: t('shieldArmoireWeaversShuttleNotes', { int: 8, per: 9 }),
    per: 9,
    int: 8,
    set: 'weaver',
  },
  shieldOfDiamonds: {
    notes: t('shieldArmoireShieldOfDiamondsNotes', { con: 10 }),
    con: 10,
    set: 'kingOfDiamonds',
  },
  flutteryFan: {
    notes: t('shieldArmoireFlutteryFanNotes', { attrs: 5 }),
    con: 5,
    int: 5,
    per: 5,
    set: 'fluttery',
  },
  fancyShoe: {
    notes: t('shieldArmoireFancyShoeNotes', { attrs: 7 }),
    int: 7,
    per: 7,
    set: 'cobbler',
  },
  fancyBlownGlassVase: {
    notes: t('shieldArmoireFancyBlownGlassVaseNotes', { int: 6 }),
    int: 6,
    set: 'glassblower',
  },
  piraticalSkullShield: {
    notes: t('shieldArmoirePiraticalSkullShieldNotes', { attrs: 4 }),
    per: 4,
    int: 4,
    set: 'piraticalPrincess',
  },
  unfinishedTome: {
    notes: t('shieldArmoireUnfinishedTomeNotes', { int: 10 }),
    int: 10,
    set: 'bookbinder',
  },
  softBluePillow: {
    notes: t('shieldArmoireSoftBluePillowNotes', { con: 10 }),
    con: 10,
    set: 'blueLoungewear',
  },
  softGreenPillow: {
    notes: t('shieldArmoireSoftGreenPillowNotes', { con: 8, int: 6 }),
    con: 8,
    int: 6,
    set: 'greenLoungewear',
  },
  softRedPillow: {
    notes: t('shieldArmoireSoftRedPillowNotes', { attrs: 5 }),
    con: 5,
    str: 5,
    set: 'redLoungewear',
  },
  mightyQuill: {
    notes: t('shieldArmoireMightyQuillNotes', { per: 9 }),
    per: 9,
    set: 'scribe',
  },
  mightyPizza: {
    notes: t('shieldArmoireMightyPizzaNotes', { per: 8 }),
    per: 8,
    set: 'chef',
  },
  trustyUmbrella: {
    notes: t('shieldArmoireTrustyUmbrellaNotes', { int: 7 }),
    int: 7,
    set: 'detective',
  },
  polishedPocketwatch: {
    notes: t('shieldArmoirePolishedPocketwatchNotes', { int: 9 }),
    int: 9,
  },
  masteredShadow: {
    notes: t('shieldArmoireMasteredShadowNotes', { attrs: 5 }),
    per: 5,
    con: 5,
    set: 'shadowMaster',
  },
  alchemistsScale: {
    notes: t('shieldArmoireAlchemistsScaleNotes', { int: 7 }),
    int: 7,
    set: 'alchemist',
  },
  birthdayBanner: {
    notes: t('shieldArmoireBirthdayBannerNotes', { str: 7 }),
    str: 7,
    set: 'birthday',
  },
  perfectMatch: {
    notes: t('shieldArmoirePerfectMatchNotes', { per: 15 }),
    per: 15,
    set: 'matchMaker',
  },
  baseballGlove: {
    notes: t('shieldArmoireBaseballGloveNotes', { str: 9 }),
    str: 9,
    set: 'baseball',
  },
  hobbyHorse: {
    notes: t('shieldArmoireHobbyHorseNotes', { attrs: 4 }),
    per: 4,
    con: 4,
    set: 'paperKnight',
  },
  fiddle: {
    notes: t('shieldArmoireFiddleNotes', { int: 6 }),
    int: 6,
    set: 'fiddler',
  },
  lifeBuoy: {
    notes: t('shieldArmoireLifeBuoyNotes', { con: 12 }),
    con: 12,
    set: 'lifeguard',
  },
};

const headAccessory = {
  comicalArrow: {
    notes: t('headAccessoryArmoireComicalArrowNotes', { str: 10 }),
    str: 10,
  },
  gogglesOfBookbinding: {
    notes: t('headAccessoryArmoireGogglesOfBookbindingNotes', { per: 8 }),
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
    notes: t('weaponArmoireMythmakerSwordNotes', { attrs: 6 }),
    str: 6,
    per: 6,
    set: 'goldenToga',
  },
  ironCrook: {
    notes: t('weaponArmoireIronCrookNotes', { attrs: 7 }),
    str: 7,
    per: 7,
    set: 'hornedIron',
  },
  goldWingStaff: {
    notes: t('weaponArmoireGoldWingStaffNotes', { attrs: 4 }),
    con: 4,
    int: 4,
    per: 4,
    str: 4,
  },
  batWand: {
    notes: t('weaponArmoireBatWandNotes', { int: 10, per: 2 }),
    int: 10,
    per: 2,
  },
  shepherdsCrook: {
    notes: t('weaponArmoireShepherdsCrookNotes', { con: 9 }),
    con: 9,
    set: 'shepherd',
  },
  crystalCrescentStaff: {
    notes: t('weaponArmoireCrystalCrescentStaffNotes', { attrs: 7 }),
    int: 7,
    str: 7,
    set: 'crystalCrescent',
  },
  blueLongbow: {
    notes: t('weaponArmoireBlueLongbowNotes', { per: 9, con: 8, str: 7 }),
    per: 9,
    con: 8,
    str: 7,
    twoHanded: true,
    set: 'blueArcher',
  },
  glowingSpear: {
    notes: t('weaponArmoireGlowingSpearNotes', { str: 15 }),
    str: 15,
  },
  barristerGavel: {
    notes: t('weaponArmoireBarristerGavelNotes', { attrs: 5 }),
    str: 5,
    con: 5,
    set: 'barrister',
  },
  jesterBaton: {
    notes: t('weaponArmoireJesterBatonNotes', { attrs: 8 }),
    int: 8,
    per: 8,
    set: 'jester',
  },
  miningPickax: {
    notes: t('weaponArmoireMiningPickaxNotes', { per: 15 }),
    per: 15,
    set: 'miner',
  },
  basicLongbow: {
    notes: t('weaponArmoireBasicLongbowNotes', { str: 6 }),
    str: 6,
    twoHanded: true,
    set: 'basicArcher',
  },
  habiticanDiploma: {
    notes: t('weaponArmoireHabiticanDiplomaNotes', { int: 11 }),
    int: 11,
    set: 'graduate',
  },
  sandySpade: {
    notes: t('weaponArmoireSandySpadeNotes', { str: 10 }),
    str: 10,
    set: 'seaside',
  },
  cannon: {
    notes: t('weaponArmoireCannonNotes', { str: 15 }),
    str: 15,
    set: 'cannoneer',
  },
  vermilionArcherBow: {
    notes: t('weaponArmoireVermilionArcherBowNotes', { str: 15 }),
    str: 15,
    twoHanded: true,
    set: 'vermilionArcher',
  },
  ogreClub: {
    notes: t('weaponArmoireOgreClubNotes', { str: 15 }),
    str: 15,
    set: 'ogre',
  },
  woodElfStaff: {
    notes: t('weaponArmoireWoodElfStaffNotes', { int: 12 }),
    int: 12,
    set: 'woodElf',
  },
  wandOfHearts: {
    notes: t('weaponArmoireWandOfHeartsNotes', { int: 13 }),
    int: 13,
    set: 'queenOfHearts',
  },
  forestFungusStaff: {
    notes: t('weaponArmoireForestFungusStaffNotes', { int: 8, per: 9 }),
    int: 8,
    per: 9,
  },
  festivalFirecracker: {
    notes: t('weaponArmoireFestivalFirecrackerNotes', { per: 8 }),
    per: 8,
    set: 'festivalAttire',
  },
  merchantsDisplayTray: {
    notes: t('weaponArmoireMerchantsDisplayTrayNotes', { int: 10 }),
    int: 10,
    set: 'merchant',
  },
  battleAxe: {
    notes: t('weaponArmoireBattleAxeNotes', { int: 6, con: 8 }),
    int: 6,
    con: 8,
  },
  hoofClippers: {
    notes: t('weaponArmoireHoofClippersNotes', { attrs: 6 }),
    con: 6,
    int: 6,
    str: 6,
    set: 'farrier',
  },
  weaversComb: {
    notes: t('weaponArmoireWeaversCombNotes', { per: 8, str: 9 }),
    per: 8,
    str: 9,
    set: 'weaver',
  },
  lamplighter: {
    notes: t('weaponArmoireLamplighterNotes', { per: 6, con: 8 }),
    per: 6,
    con: 8,
    set: 'lamplighter',
  },
  coachDriversWhip: {
    notes: t('weaponArmoireCoachDriversWhipNotes', { str: 6, int: 8 }),
    str: 6,
    int: 8,
    set: 'coachDriver',
  },
  scepterOfDiamonds: {
    notes: t('weaponArmoireScepterOfDiamondsNotes', { str: 13 }),
    str: 13,
    set: 'kingOfDiamonds',
  },
  flutteryArmy: {
    notes: t('weaponArmoireFlutteryArmyNotes', { attrs: 5 }),
    con: 5,
    int: 5,
    str: 5,
    set: 'fluttery',
  },
  cobblersHammer: {
    notes: t('weaponArmoireCobblersHammerNotes', { attrs: 7 }),
    con: 7,
    str: 7,
    set: 'cobbler',
  },
  glassblowersBlowpipe: {
    notes: t('weaponArmoireGlassblowersBlowpipeNotes', { str: 6 }),
    str: 6,
    set: 'glassblower',
  },
  poisonedGoblet: {
    notes: t('weaponArmoirePoisonedGobletNotes', { int: 7 }),
    int: 7,
    set: 'piraticalPrincess',
  },
  jeweledArcherBow: {
    notes: t('weaponArmoireJeweledArcherBowNotes', { int: 15 }),
    twoHanded: true,
    int: 15,
    set: 'jeweledArcher',
  },
  needleOfBookbinding: {
    notes: t('weaponArmoireNeedleOfBookbindingNotes', { str: 8 }),
    str: 8,
    set: 'bookbinder',
  },
  spearOfSpades: {
    notes: t('weaponArmoireSpearOfSpadesNotes', { con: 13 }),
    con: 13,
    set: 'aceOfSpades',
  },
  arcaneScroll: {
    notes: t('weaponArmoireArcaneScrollNotes', { int: 9 }),
    int: 9,
    set: 'scribe',
  },
  chefsSpoon: {
    notes: t('weaponArmoireChefsSpoonNotes', { int: 8 }),
    int: 8,
    set: 'chef',
  },
  vernalTaper: {
    notes: t('weaponArmoireVernalTaperNotes', { con: 8 }),
    con: 8,
    set: 'vernalVestments',
  },
  jugglingBalls: {
    notes: t('weaponArmoireJugglingBallsNotes', { int: 10 }),
    int: 10,
  },
  slingshot: {
    notes: t('weaponArmoireSlingshotNotes', { str: 10 }),
    str: 10,
  },
  nephriteBow: {
    notes: t('weaponArmoireNephriteBowNotes', { int: 7, str: 6 }),
    int: 7,
    str: 6,
    set: 'nephrite',
    twoHanded: true,
  },
  bambooCane: {
    notes: t('weaponArmoireBambooCaneNotes', { attrs: 6 }),
    int: 6,
    per: 6,
    con: 6,
    set: 'boating',
  },
  astronomersTelescope: {
    notes: t('weaponArmoireAstronomersTelescopeNotes', { per: 10 }),
    per: 10,
    set: 'astronomer',
  },
  magnifyingGlass: {
    notes: t('weaponArmoireMagnifyingGlassNotes', { per: 7 }),
    per: 7,
    set: 'detective',
  },
  floridFan: {
    notes: t('weaponArmoireFloridFanNotes', { con: 9 }),
    con: 9,
  },
  resplendentRapier: {
    notes: t('weaponArmoireResplendentRapierNotes', { per: 9 }),
    per: 9,
  },
  shadowMastersMace: {
    notes: t('weaponArmoireShadowMastersMaceNotes', { per: 12 }),
    per: 12,
    set: 'shadowMaster',
  },
  alchemistsDistiller: {
    notes: t('weaponArmoireAlchemistsDistillerNotes', { str: 8, int: 5 }),
    str: 8,
    int: 5,
    set: 'alchemist',
  },
  happyBanner: {
    notes: t('weaponArmoireHappyBannerNotes', { per: 7 }),
    per: 7,
    set: 'birthday',
  },
  livelyMatch: {
    notes: t('weaponArmoireLivelyMatchNotes', { str: 15 }),
    str: 15,
    set: 'matchMaker',
  },
  baseballBat: {
    notes: t('weaponArmoireBaseballBatNotes', { con: 9 }),
    con: 9,
    set: 'baseball',
  },
  paperCutter: {
    notes: t('weaponArmoirePaperCutterNotes', { str: 9 }),
    str: 9,
    set: 'paperKnight',
  },
  fiddlersBow: {
    notes: t('weaponArmoireFiddlersBowNotes', { str: 6 }),
    str: 6,
    set: 'fiddler',
  },
  beachFlag: {
    notes: t('weaponArmoireBeachFlagNotes', { per: 12 }),
    per: 12,
    set: 'lifeguard',
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
    defaults(gearItem, {
      canOwn: ownsItem(`${setKey}_armoire_${gearKey}`),
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
