import { ownsItem } from '../gear-helper';
import t from '../../translation';

let armor = {
  lunarArmor: {
    text: t('armorArmoireLunarArmorText'),
    notes: t('armorArmoireLunarArmorNotes', { str: 7, int: 7 }),
    value: 100,
    str: 7,
    int: 7,
    set: 'soothing',
    canOwn: ownsItem('armor_armoire_lunarArmor'),
  },
  gladiatorArmor: {
    text: t('armorArmoireGladiatorArmorText'),
    notes: t('armorArmoireGladiatorArmorNotes', { str: 7, per: 7 }),
    value: 100,
    str: 7,
    per: 7,
    set: 'gladiator',
    canOwn: ownsItem('armor_armoire_gladiatorArmor'),
  },
  rancherRobes: {
    text: t('armorArmoireRancherRobesText'),
    notes: t('armorArmoireRancherRobesNotes', { str: 5, per: 5, int: 5 }),
    value: 100,
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
    canOwn: ownsItem('armor_armoire_rancherRobes'),
  },
  goldenToga: {
    text: t('armorArmoireGoldenTogaText'),
    notes: t('armorArmoireGoldenTogaNotes', { attrs: 8 }),
    value: 100,
    str: 8,
    con: 8,
    set: 'goldenToga',
    canOwn: ownsItem('armor_armoire_goldenToga'),
  },
  hornedIronArmor: {
    text: t('armorArmoireHornedIronArmorText'),
    notes: t('armorArmoireHornedIronArmorNotes', { con: 9, per: 7 }),
    value: 100,
    con: 9,
    per: 7,
    set: 'hornedIron',
    canOwn: ownsItem('armor_armoire_hornedIronArmor'),
  },
  plagueDoctorOvercoat: {
    text: t('armorArmoirePlagueDoctorOvercoatText'),
    notes: t('armorArmoirePlagueDoctorOvercoatNotes', { int: 6, str: 5, con: 6 }),
    value: 100,
    int: 6,
    str: 5,
    con: 6,
    set: 'plagueDoctor',
    canOwn: ownsItem('armor_armoire_plagueDoctorOvercoat'),
  },
  shepherdRobes: {
    text: t('armorArmoireShepherdRobesText'),
    notes: t('armorArmoireShepherdRobesNotes', { attrs: 9 }),
    value: 100,
    str: 9,
    per: 9,
    set: 'shepherd',
    canOwn: ownsItem('armor_armoire_shepherdRobes'),
  },
  royalRobes: {
    text: t('armorArmoireRoyalRobesText'),
    notes: t('armorArmoireRoyalRobesNotes', { attrs: 5 }),
    value: 100,
    con: 5,
    per: 5,
    int: 5,
    set: 'royal',
    canOwn: ownsItem('armor_armoire_royalRobes'),
  },
  crystalCrescentRobes: {
    text: t('armorArmoireCrystalCrescentRobesText'),
    notes: t('armorArmoireCrystalCrescentRobesNotes', { attrs: 7 }),
    value: 100,
    per: 7,
    con: 7,
    set: 'crystalCrescent',
    canOwn: ownsItem('armor_armoire_crystalCrescentRobes'),
  },
  dragonTamerArmor: {
    text: t('armorArmoireDragonTamerArmorText'),
    notes: t('armorArmoireDragonTamerArmorNotes', { con: 15 }),
    value: 100,
    con: 15,
    set: 'dragonTamer',
    canOwn: ownsItem('armor_armoire_dragonTamerArmor'),
  },
  barristerRobes: {
    text: t('armorArmoireBarristerRobesText'),
    notes: t('armorArmoireBarristerRobesNotes', { con: 10 }),
    value: 100,
    con: 10,
    set: 'barrister',
    canOwn: ownsItem('armor_armoire_barristerRobes'),
  },
  jesterCostume: {
    text: t('armorArmoireJesterCostumeText'),
    notes: t('armorArmoireJesterCostumeNotes', { int: 15 }),
    value: 100,
    int: 15,
    set: 'jester',
    canOwn: ownsItem('armor_armoire_jesterCostume'),
  },
  minerOveralls: {
    text: t('armorArmoireMinerOverallsText'),
    notes: t('armorArmoireMinerOverallsNotes', { con: 10 }),
    value: 100,
    con: 10,
    set: 'miner',
    canOwn: ownsItem('armor_armoire_minerOveralls'),
  },
  basicArcherArmor: {
    text: t('armorArmoireBasicArcherArmorText'),
    notes: t('armorArmoireBasicArcherArmorNotes', { per: 12 }),
    value: 100,
    per: 12,
    set: 'basicArcher',
    canOwn: ownsItem('armor_armoire_basicArcherArmor'),
  },
  graduateRobe: {
    text: t('armorArmoireGraduateRobeText'),
    notes: t('armorArmoireGraduateRobeNotes', { int: 10 }),
    value: 100,
    int: 10,
    set: 'graduate',
    canOwn: ownsItem('armor_armoire_graduateRobe'),
  },
  stripedSwimsuit: {
    text: t('armorArmoireStripedSwimsuitText'),
    notes: t('armorArmoireStripedSwimsuitNotes', { con: 13 }),
    value: 100,
    con: 13,
    set: 'seaside',
    canOwn: ownsItem('armor_armoire_stripedSwimsuit'),
  },
  cannoneerRags: {
    text: t('armorArmoireCannoneerRagsText'),
    notes: t('armorArmoireCannoneerRagsNotes', { con: 15 }),
    value: 100,
    con: 15,
    set: 'cannoneer',
    canOwn: ownsItem('armor_armoire_cannoneerRags'),
  },
  falconerArmor: {
    text: t('armorArmoireFalconerArmorText'),
    notes: t('armorArmoireFalconerArmorNotes', { con: 10 }),
    value: 100,
    con: 10,
    set: 'falconer',
    canOwn: ownsItem('armor_armoire_falconerArmor'),
  },
  vermilionArcherArmor: {
    text: t('armorArmoireVermilionArcherArmorText'),
    notes: t('armorArmoireVermilionArcherArmorNotes', { per: 15 }),
    value: 100,
    per: 15,
    set: 'vermilionArcher',
    canOwn: ownsItem('armor_armoire_vermilionArcherArmor'),
  },
  ogreArmor: {
    text: t('armorArmoireOgreArmorText'),
    notes: t('armorArmoireOgreArmorNotes', { con: 15 }),
    value: 100,
    con: 15,
    set: 'ogre',
    canOwn: ownsItem('armor_armoire_ogreArmor'),
  },
  ironBlueArcherArmor: {
    text: t('armorArmoireIronBlueArcherArmorText'),
    notes: t('armorArmoireIronBlueArcherArmorNotes', { str: 12 }),
    value: 100,
    str: 12,
    set: 'blueArcher',
    canOwn: ownsItem('armor_armoire_ironBlueArcherArmor'),
  },
  redPartyDress: {
    text: t('armorArmoireRedPartyDressText'),
    notes: t('armorArmoireRedPartyDressNotes', { attrs: 7 }),
    value: 100,
    str: 7,
    con: 7,
    int: 7,
    set: 'redHairbow',
    canOwn: ownsItem('armor_armoire_redPartyDress'),
  },
  woodElfArmor: {
    text: t('armorArmoireWoodElfArmorText'),
    notes: t('armorArmoireWoodElfArmorNotes', { per: 12 }),
    value: 100,
    per: 12,
    set: 'woodElf',
    canOwn: ownsItem('armor_armoire_woodElfArmor'),
  },
  ramFleeceRobes: {
    text: t('armorArmoireRamFleeceRobesText'),
    notes: t('armorArmoireRamFleeceRobesNotes', { con: 9, str: 7 }),
    value: 100,
    con: 9,
    str: 7,
    set: 'ramBarbarian',
    canOwn: ownsItem('armor_armoire_ramFleeceRobes'),
  },
  gownOfHearts: {
    text: t('armorArmoireGownOfHeartsText'),
    notes: t('armorArmoireGownOfHeartsNotes', { con: 13 }),
    value: 100,
    con: 13,
    set: 'queenOfHearts',
    canOwn: ownsItem('armor_armoire_gownOfHearts'),
  },
  mushroomDruidArmor: {
    text: t('armorArmoireMushroomDruidArmorText'),
    notes: t('armorArmoireMushroomDruidArmorNotes', { con: 7, per: 8 }),
    value: 100,
    con: 7,
    per: 8,
    set: 'mushroomDruid',
    canOwn: ownsItem('armor_armoire_mushroomDruidArmor'),
  },
  greenFestivalYukata: {
    text: t('armorArmoireGreenFestivalYukataText'),
    notes: t('armorArmoireGreenFestivalYukataNotes', { attrs: 8 }),
    value: 100,
    con: 8,
    per: 8,
    set: 'festivalAttire',
    canOwn: ownsItem('armor_armoire_greenFestivalYukata'),
  },
  merchantTunic: {
    text: t('armorArmoireMerchantTunicText'),
    notes: t('armorArmoireMerchantTunicNotes', { per: 10 }),
    value: 100,
    per: 10,
    set: 'merchant',
    canOwn: ownsItem('armor_armoire_merchantTunic'),
  },
  vikingTunic: {
    text: t('armorArmoireVikingTunicText'),
    notes: t('armorArmoireVikingTunicNotes', { con: 6, str: 8 }),
    value: 100,
    con: 6,
    str: 8,
    set: 'viking',
    canOwn: ownsItem('armor_armoire_vikingTunic'),
  },
  swanDancerTutu: {
    text: t('armorArmoireSwanDancerTutuText'),
    notes: t('armorArmoireSwanDancerTutuNotes', { attrs: 8 }),
    value: 100,
    int: 8,
    str: 8,
    set: 'swanDancer',
    canOwn: ownsItem('armor_armoire_swanDancerTutu'),
  },
  yellowPartyDress: {
    text: t('armorArmoireYellowPartyDressText'),
    notes: t('armorArmoireYellowPartyDressNotes', { attrs: 7 }),
    value: 100,
    per: 7,
    int: 7,
    str: 7,
    set: 'yellowHairbow',
    canOwn: ownsItem('armor_armoire_yellowPartyDress'),
  },
  antiProcrastinationArmor: {
    text: t('armorArmoireAntiProcrastinationArmorText'),
    notes: t('armorArmoireAntiProcrastinationArmorNotes', { str: 15 }),
    value: 100,
    str: 15,
    set: 'antiProcrastination',
    canOwn: ownsItem('armor_armoire_antiProcrastinationArmor'),
  },
  farrierOutfit: {
    text: t('armorArmoireFarrierOutfitText'),
    notes: t('armorArmoireFarrierOutfitNotes', { attrs: 6 }),
    value: 100,
    con: 6,
    int: 6,
    per: 6,
    set: 'farrier',
    canOwn: ownsItem('armor_armoire_farrierOutfit'),
  },
  candlestickMakerOutfit: {
    text: t('armorArmoireCandlestickMakerOutfitText'),
    notes: t('armorArmoireCandlestickMakerOutfitNotes', { con: 12 }),
    value: 100,
    con: 12,
    set: 'candlestickMaker',
    canOwn: ownsItem('armor_armoire_candlestickMakerOutfit'),
  },
  wovenRobes: {
    text: t('armorArmoireWovenRobesText'),
    notes: t('armorArmoireWovenRobesNotes', { con: 8, int: 9 }),
    value: 100,
    con: 8,
    int: 9,
    set: 'weaver',
    canOwn: ownsItem('armor_armoire_wovenRobes'),
  },
  lamplightersGreatcoat: {
    text: t('armorArmoireLamplightersGreatcoatText'),
    notes: t('armorArmoireLamplightersGreatcoatNotes', { per: 14 }),
    value: 100,
    per: 14,
    set: 'lamplighter',
    canOwn: ownsItem('armor_armoire_lamplightersGreatcoat'),
  },
};

let body = {
  cozyScarf: {
    text: t('bodyArmoireCozyScarfText'),
    notes: t('bodyArmoireCozyScarfNotes'),
    value: 100,
    set: 'lamplighter',
    canOwn: ownsItem('body_armoire_cozyScarf'),
  },
};

let eyewear = {
  plagueDoctorMask: {
    text: t('eyewearArmoirePlagueDoctorMaskText'),
    notes: t('eyewearArmoirePlagueDoctorMaskNotes'),
    value: 100,
    set: 'plagueDoctor',
    canOwn: ownsItem('eyewear_armoire_plagueDoctorMask'),
  },
};

let head = {
  lunarCrown: {
    text: t('headArmoireLunarCrownText'),
    notes: t('headArmoireLunarCrownNotes', { con: 7, per: 7 }),
    value: 100,
    con: 7,
    per: 7,
    set: 'soothing',
    canOwn: ownsItem('head_armoire_lunarCrown'),
  },
  redHairbow: {
    text: t('headArmoireRedHairbowText'),
    notes: t('headArmoireRedHairbowNotes', { str: 5, int: 5, con: 5 }),
    value: 100,
    str: 5,
    int: 5,
    con: 5,
    set: 'redHairbow',
    canOwn: ownsItem('head_armoire_redHairbow'),
  },
  violetFloppyHat: {
    text: t('headArmoireVioletFloppyHatText'),
    notes: t('headArmoireVioletFloppyHatNotes', { per: 5, int: 5, con: 5 }),
    value: 100,
    per: 5,
    int: 5,
    con: 5,
    canOwn: ownsItem('head_armoire_violetFloppyHat'),
  },
  gladiatorHelm: {
    text: t('headArmoireGladiatorHelmText'),
    notes: t('headArmoireGladiatorHelmNotes', { per: 7, int: 7 }),
    value: 100,
    per: 7,
    int: 7,
    set: 'gladiator',
    canOwn: ownsItem('head_armoire_gladiatorHelm'),
  },
  rancherHat: {
    text: t('headArmoireRancherHatText'),
    notes: t('headArmoireRancherHatNotes', { str: 5, per: 5, int: 5 }),
    value: 100,
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
    canOwn: ownsItem('head_armoire_rancherHat'),
  },
  royalCrown: {
    text: t('headArmoireRoyalCrownText'),
    notes: t('headArmoireRoyalCrownNotes', { str: 10 }),
    value: 100,
    str: 10,
    set: 'royal',
    canOwn: ownsItem('head_armoire_royalCrown'),
  },
  blueHairbow: {
    text: t('headArmoireBlueHairbowText'),
    notes: t('headArmoireBlueHairbowNotes', { per: 5, int: 5, con: 5 }),
    value: 100,
    per: 5,
    int: 5,
    con: 5,
    canOwn: ownsItem('head_armoire_blueHairbow'),
  },
  goldenLaurels: {
    text: t('headArmoireGoldenLaurelsText'),
    notes: t('headArmoireGoldenLaurelsNotes', { attrs: 8 }),
    value: 100,
    per: 8,
    con: 8,
    set: 'goldenToga',
    canOwn: ownsItem('head_armoire_goldenLaurels'),
  },
  hornedIronHelm: {
    text: t('headArmoireHornedIronHelmText'),
    notes: t('headArmoireHornedIronHelmNotes', { con: 9, str: 7 }),
    value: 100,
    con: 9,
    str: 7,
    set: 'hornedIron',
    canOwn: ownsItem('head_armoire_hornedIronHelm'),
  },
  yellowHairbow: {
    text: t('headArmoireYellowHairbowText'),
    notes: t('headArmoireYellowHairbowNotes', { attrs: 5 }),
    value: 100,
    int: 5,
    per: 5,
    str: 5,
    set: 'yellowHairbow',
    canOwn: ownsItem('head_armoire_yellowHairbow'),
  },
  redFloppyHat: {
    text: t('headArmoireRedFloppyHatText'),
    notes: t('headArmoireRedFloppyHatNotes', { attrs: 6 }),
    value: 100,
    con: 6,
    int: 6,
    per: 6,
    canOwn: ownsItem('head_armoire_redFloppyHat'),
  },
  plagueDoctorHat: {
    text: t('headArmoirePlagueDoctorHatText'),
    notes: t('headArmoirePlagueDoctorHatNotes', { int: 5, str: 6, con: 5 }),
    value: 100,
    int: 5,
    str: 6,
    con: 5,
    set: 'plagueDoctor',
    canOwn: ownsItem('head_armoire_plagueDoctorHat'),
  },
  blackCat: {
    text: t('headArmoireBlackCatText'),
    notes: t('headArmoireBlackCatNotes', { attrs: 9 }),
    value: 100,
    int: 9,
    per: 9,
    canOwn: ownsItem('head_armoire_blackCat'),
  },
  orangeCat: {
    text: t('headArmoireOrangeCatText'),
    notes: t('headArmoireOrangeCatNotes', { attrs: 9 }),
    value: 100,
    con: 9,
    str: 9,
    canOwn: ownsItem('head_armoire_orangeCat'),
  },
  blueFloppyHat: {
    text: t('headArmoireBlueFloppyHatText'),
    notes: t('headArmoireBlueFloppyHatNotes', { attrs: 7 }),
    value: 100,
    per: 7,
    int: 7,
    con: 7,
    canOwn: ownsItem('head_armoire_blueFloppyHat'),
  },
  shepherdHeaddress: {
    text: t('headArmoireShepherdHeaddressText'),
    notes: t('headArmoireShepherdHeaddressNotes', { int: 9 }),
    value: 100,
    int: 9,
    set: 'shepherd',
    canOwn: ownsItem('head_armoire_shepherdHeaddress'),
  },
  crystalCrescentHat: {
    text: t('headArmoireCrystalCrescentHatText'),
    notes: t('headArmoireCrystalCrescentHatNotes', { attrs: 7 }),
    value: 100,
    int: 7,
    per: 7,
    set: 'crystalCrescent',
    canOwn: ownsItem('head_armoire_crystalCrescentHat'),
  },
  dragonTamerHelm: {
    text: t('headArmoireDragonTamerHelmText'),
    notes: t('headArmoireDragonTamerHelmNotes', { int: 15 }),
    value: 100,
    int: 15,
    set: 'dragonTamer',
    canOwn: ownsItem('head_armoire_dragonTamerHelm'),
  },
  barristerWig: {
    text: t('headArmoireBarristerWigText'),
    notes: t('headArmoireBarristerWigNotes', { str: 10 }),
    value: 100,
    str: 10,
    set: 'barrister',
    canOwn: ownsItem('head_armoire_barristerWig'),
  },
  jesterCap: {
    text: t('headArmoireJesterCapText'),
    notes: t('headArmoireJesterCapNotes', { per: 15 }),
    value: 100,
    per: 15,
    set: 'jester',
    canOwn: ownsItem('head_armoire_jesterCap'),
  },
  minerHelmet: {
    text: t('headArmoireMinerHelmetText'),
    notes: t('headArmoireMinerHelmetNotes', { int: 5 }),
    value: 100,
    int: 5,
    set: 'miner',
    canOwn: ownsItem('head_armoire_minerHelmet'),
  },
  basicArcherCap: {
    text: t('headArmoireBasicArcherCapText'),
    notes: t('headArmoireBasicArcherCapNotes', { per: 6 }),
    value: 100,
    per: 6,
    set: 'basicArcher',
    canOwn: ownsItem('head_armoire_basicArcherCap'),
  },
  graduateCap: {
    text: t('headArmoireGraduateCapText'),
    notes: t('headArmoireGraduateCapNotes', { int: 9 }),
    value: 100,
    int: 9,
    set: 'graduate',
    canOwn: ownsItem('head_armoire_graduateCap'),
  },
  greenFloppyHat: {
    text: t('headArmoireGreenFloppyHatText'),
    notes: t('headArmoireGreenFloppyHatNotes', { attrs: 8 }),
    value: 100,
    per: 8,
    int: 8,
    con: 8,
    canOwn: ownsItem('head_armoire_greenFloppyHat'),
  },
  cannoneerBandanna: {
    text: t('headArmoireCannoneerBandannaText'),
    notes: t('headArmoireCannoneerBandannaNotes', { attrs: 15 }),
    value: 100,
    int: 15,
    per: 15,
    set: 'cannoneer',
    canOwn: ownsItem('head_armoire_cannoneerBandanna'),
  },
  falconerCap: {
    text: t('headArmoireFalconerCapText'),
    notes: t('headArmoireFalconerCapNotes', { int: 10 }),
    value: 100,
    int: 10,
    set: 'falconer',
    canOwn: ownsItem('head_armoire_falconerCap'),
  },
  vermilionArcherHelm: {
    text: t('headArmoireVermilionArcherHelmText'),
    notes: t('headArmoireVermilionArcherHelmNotes', { per: 12 }),
    value: 100,
    per: 12,
    set: 'vermilionArcher',
    canOwn: ownsItem('head_armoire_vermilionArcherHelm'),
  },
  ogreMask: {
    text: t('headArmoireOgreMaskText'),
    notes: t('headArmoireOgreMaskNotes', { attrs: 7 }),
    value: 100,
    con: 7,
    str: 7,
    set: 'ogre',
    canOwn: ownsItem('head_armoire_ogreMask'),
  },
  ironBlueArcherHelm: {
    text: t('headArmoireIronBlueArcherHelmText'),
    notes: t('headArmoireIronBlueArcherHelmNotes', { con: 9 }),
    value: 100,
    con: 9,
    set: 'blueArcher',
    canOwn: ownsItem('head_armoire_ironBlueArcherHelm'),
  },
  woodElfHelm: {
    text: t('headArmoireWoodElfHelmText'),
    notes: t('headArmoireWoodElfHelmNotes', { con: 12 }),
    value: 100,
    con: 12,
    set: 'woodElf',
    canOwn: ownsItem('head_armoire_woodElfHelm'),
  },
  ramHeaddress: {
    text: t('headArmoireRamHeaddressText'),
    notes: t('headArmoireRamHeaddressNotes', { con: 9, per: 7 }),
    value: 100,
    con: 9,
    per: 7,
    set: 'ramBarbarian',
    canOwn: ownsItem('head_armoire_ramHeaddress'),
  },
  crownOfHearts: {
    text: t('headArmoireCrownOfHeartsText'),
    notes: t('headArmoireCrownOfHeartsNotes', { str: 13 }),
    value: 100,
    str: 13,
    set: 'queenOfHearts',
    canOwn: ownsItem('head_armoire_crownOfHearts'),
  },
  mushroomDruidCap: {
    text: t('headArmoireMushroomDruidCapText'),
    notes: t('headArmoireMushroomDruidCapNotes', { int: 6, str: 7 }),
    value: 100,
    int: 6,
    str: 7,
    set: 'mushroomDruid',
    canOwn: ownsItem('head_armoire_mushroomDruidCap'),
  },
  merchantChaperon: {
    text: t('headArmoireMerchantChaperonText'),
    notes: t('headArmoireMerchantChaperonNotes', { attrs: 7 }),
    value: 100,
    int: 7,
    per: 7,
    set: 'merchant',
    canOwn: ownsItem('head_armoire_merchantChaperon'),
  },
  vikingHelm: {
    text: t('headArmoireVikingHelmText'),
    notes: t('headArmoireVikingHelmNotes', { str: 6, per: 8 }),
    value: 100,
    str: 6,
    per: 8,
    set: 'viking',
    canOwn: ownsItem('head_armoire_vikingHelm'),
  },
  swanFeatherCrown: {
    text: t('headArmoireSwanFeatherCrownText'),
    notes: t('headArmoireSwanFeatherCrownNotes', { int: 8 }),
    value: 100,
    int: 8,
    set: 'swanDancer',
    canOwn: ownsItem('head_armoire_swanFeatherCrown'),
  },
  antiProcrastinationHelm: {
    text: t('headArmoireAntiProcrastinationHelmText'),
    notes: t('headArmoireAntiProcrastinationHelmNotes', { per: 15 }),
    value: 100,
    per: 15,
    set: 'antiProcrastination',
    canOwn: ownsItem('head_armoire_antiProcrastinationHelm'),
  },
  candlestickMakerHat: {
    text: t('headArmoireCandlestickMakerHatText'),
    notes: t('headArmoireCandlestickMakerHatNotes', { attrs: 6 }),
    value: 100,
    int: 6,
    per: 6,
    set: 'candlestickMaker',
    canOwn: ownsItem('head_armoire_candlestickMakerHat'),
  },
  lamplightersTopHat: {
    text: t('headArmoireLamplightersTopHatText'),
    notes: t('headArmoireLamplightersTopHatNotes', { con: 14 }),
    value: 100,
    con: 14,
    set: 'lamplighter',
    canOwn: ownsItem('head_armoire_lamplightersTopHat'),
  },
};

let shield = {
  gladiatorShield: {
    text: t('shieldArmoireGladiatorShieldText'),
    notes: t('shieldArmoireGladiatorShieldNotes', { con: 5, str: 5 }),
    value: 100,
    con: 5,
    str: 5,
    set: 'gladiator',
    canOwn: ownsItem('shield_armoire_gladiatorShield'),
  },
  midnightShield: {
    text: t('shieldArmoireMidnightShieldText'),
    notes: t('shieldArmoireMidnightShieldNotes', { con: 10, str: 2 }),
    value: 100,
    con: 10,
    str: 2,
    canOwn: ownsItem('shield_armoire_midnightShield'),
  },
  royalCane: {
    text: t('shieldArmoireRoyalCaneText'),
    notes: t('shieldArmoireRoyalCaneNotes', { attrs: 5 }),
    value: 100,
    con: 5,
    int: 5,
    per: 5,
    set: 'royal',
    canOwn: ownsItem('shield_armoire_royalCane'),
  },
  dragonTamerShield: {
    text: t('shieldArmoireDragonTamerShieldText'),
    notes: t('shieldArmoireDragonTamerShieldNotes', { per: 15 }),
    value: 100,
    per: 15,
    set: 'dragonTamer',
    canOwn: ownsItem('shield_armoire_dragonTamerShield'),
  },
  mysticLamp: {
    text: t('shieldArmoireMysticLampText'),
    notes: t('shieldArmoireMysticLampNotes', { per: 15 }),
    value: 100,
    per: 15,
    canOwn: ownsItem('shield_armoire_mysticLamp'),
  },
  floralBouquet: {
    text: t('shieldArmoireFloralBouquetText'),
    notes: t('shieldArmoireFloralBouquetNotes', { con: 3 }),
    value: 100,
    con: 3,
    canOwn: ownsItem('shield_armoire_floralBouquet'),
  },
  sandyBucket: {
    text: t('shieldArmoireSandyBucketText'),
    notes: t('shieldArmoireSandyBucketNotes', { per: 10 }),
    value: 100,
    per: 10,
    set: 'seaside',
    canOwn: ownsItem('shield_armoire_sandyBucket'),
  },
  perchingFalcon: {
    text: t('shieldArmoirePerchingFalconText'),
    notes: t('shieldArmoirePerchingFalconNotes', { str: 16 }),
    value: 100,
    str: 16,
    set: 'falconer',
    canOwn: ownsItem('shield_armoire_perchingFalcon'),
  },
  ramHornShield: {
    text: t('shieldArmoireRamHornShieldText'),
    notes: t('shieldArmoireRamHornShieldNotes', { attrs: 7 }),
    value: 100,
    str: 7,
    con: 7,
    set: 'ramBarbarian',
    canOwn: ownsItem('shield_armoire_ramHornShield'),
  },
  redRose: {
    text: t('shieldArmoireRedRoseText'),
    notes: t('shieldArmoireRedRoseNotes', { per: 10 }),
    value: 100,
    per: 10,
    canOwn: ownsItem('shield_armoire_redRose'),
  },
  mushroomDruidShield: {
    text: t('shieldArmoireMushroomDruidShieldText'),
    notes: t('shieldArmoireMushroomDruidShieldNotes', { con: 9, str: 8 }),
    value: 100,
    con: 9,
    str: 8,
    set: 'mushroomDruid',
    canOwn: ownsItem('shield_armoire_mushroomDruidShield'),
  },
  festivalParasol: {
    text: t('shieldArmoireFestivalParasolText'),
    notes: t('shieldArmoireFestivalParasolNotes', { con: 8 }),
    value: 100,
    con: 8,
    set: 'festivalAttire',
    canOwn: ownsItem('shield_armoire_festivalParasol'),
  },
  vikingShield: {
    text: t('shieldArmoireVikingShieldText'),
    notes: t('shieldArmoireVikingShieldNotes', { per: 6, int: 8 }),
    value: 100,
    per: 6,
    int: 8,
    set: 'viking',
    canOwn: ownsItem('shield_armoire_vikingShield'),
  },
  swanFeatherFan: {
    text: t('shieldArmoireSwanFeatherFanText'),
    notes: t('shieldArmoireSwanFeatherFanNotes', { str: 8 }),
    value: 100,
    str: 8,
    set: 'swanDancer',
    canOwn: ownsItem('shield_armoire_swanFeatherFan'),
  },
  goldenBaton: {
    text: t('shieldArmoireGoldenBatonText'),
    notes: t('shieldArmoireGoldenBatonNotes', { attrs: 4 }),
    value: 100,
    int: 4,
    str: 4,
    canOwn: ownsItem('shield_armoire_goldenBaton'),
  },
  antiProcrastinationShield: {
    text: t('shieldArmoireAntiProcrastinationShieldText'),
    notes: t('shieldArmoireAntiProcrastinationShieldNotes', { con: 15 }),
    value: 100,
    con: 15,
    set: 'antiProcrastination',
    canOwn: ownsItem('shield_armoire_antiProcrastinationShield'),
  },
  horseshoe: {
    text: t('shieldArmoireHorseshoeText'),
    notes: t('shieldArmoireHorseshoeNotes', { attrs: 6 }),
    value: 100,
    con: 6,
    per: 6,
    str: 6,
    set: 'farrier',
    canOwn: ownsItem('shield_armoire_horseshoe'),
  },
  handmadeCandlestick: {
    text: t('shieldArmoireHandmadeCandlestickText'),
    notes: t('shieldArmoireHandmadeCandlestickNotes', { str: 12 }),
    value: 100,
    str: 12,
    set: 'candlestickMaker',
    canOwn: ownsItem('shield_armoire_handmadeCandlestick'),
  },
  weaversShuttle: {
    text: t('shieldArmoireWeaversShuttleText'),
    notes: t('shieldArmoireWeaversShuttleNotes', { int: 8, per: 9 }),
    value: 100,
    per: 9,
    int: 8,
    set: 'weaver',
    canOwn: ownsItem('shield_armoire_weaversShuttle'),
  },
};

let headAccessory = {
  comicalArrow: {
    text: t('headAccessoryArmoireComicalArrowText'),
    notes: t('headAccessoryArmoireComicalArrowNotes'),
    value: 100,
    canOwn: ownsItem('headAccessory_armoire_comicalArrow'),
  },
};

let weapon = {
  basicCrossbow: {
    text: t('weaponArmoireBasicCrossbowText'),
    notes: t('weaponArmoireBasicCrossbowNotes', { str: 5, per: 5, con: 5 }),
    value: 100,
    str: 5,
    per: 5,
    con: 5,
    canOwn: ownsItem('weapon_armoire_basicCrossbow'),
  },
  lunarSceptre: {
    text: t('weaponArmoireLunarSceptreText'),
    notes: t('weaponArmoireLunarSceptreNotes', { con: 7, int: 7 }),
    value: 100,
    con: 7,
    int: 7,
    set: 'soothing',
    canOwn: ownsItem('weapon_armoire_lunarSceptre'),
  },
  rancherLasso: {
    twoHanded: true,
    text: t('weaponArmoireRancherLassoText'),
    notes: t('weaponArmoireRancherLassoNotes', { str: 5, per: 5, int: 5 }),
    value: 100,
    str: 5,
    per: 5,
    int: 5,
    set: 'rancher',
    canOwn: ownsItem('weapon_armoire_rancherLasso'),
  },
  mythmakerSword: {
    text: t('weaponArmoireMythmakerSwordText'),
    notes: t('weaponArmoireMythmakerSwordNotes', { attrs: 6 }),
    value: 100,
    str: 6,
    per: 6,
    set: 'goldenToga',
    canOwn: ownsItem('weapon_armoire_mythmakerSword'),
  },
  ironCrook: {
    text: t('weaponArmoireIronCrookText'),
    notes: t('weaponArmoireIronCrookNotes', { attrs: 7 }),
    value: 100,
    str: 7,
    per: 7,
    set: 'hornedIron',
    canOwn: ownsItem('weapon_armoire_ironCrook'),
  },
  goldWingStaff: {
    text: t('weaponArmoireGoldWingStaffText'),
    notes: t('weaponArmoireGoldWingStaffNotes', { attrs: 4 }),
    value: 100,
    con: 4,
    int: 4,
    per: 4,
    str: 4,
    canOwn: ownsItem('weapon_armoire_goldWingStaff'),
  },
  batWand: {
    text: t('weaponArmoireBatWandText'),
    notes: t('weaponArmoireBatWandNotes', { int: 10, per: 2 }),
    value: 100,
    int: 10,
    per: 2,
    canOwn: ownsItem('weapon_armoire_batWand'),
  },
  shepherdsCrook: {
    text: t('weaponArmoireShepherdsCrookText'),
    notes: t('weaponArmoireShepherdsCrookNotes', { con: 9 }),
    value: 100,
    con: 9,
    set: 'shepherd',
    canOwn: ownsItem('weapon_armoire_shepherdsCrook'),
  },
  crystalCrescentStaff: {
    text: t('weaponArmoireCrystalCrescentStaffText'),
    notes: t('weaponArmoireCrystalCrescentStaffNotes', { attrs: 7 }),
    value: 100,
    int: 7,
    str: 7,
    set: 'crystalCrescent',
    canOwn: ownsItem('weapon_armoire_crystalCrescentStaff'),
  },
  blueLongbow: {
    text: t('weaponArmoireBlueLongbowText'),
    notes: t('weaponArmoireBlueLongbowNotes', { per: 9, con: 8, str: 7 }),
    value: 100,
    per: 9,
    con: 8,
    str: 7,
    twoHanded: true,
    set: 'blueArcher',
    canOwn: ownsItem('weapon_armoire_blueLongbow'),
  },
  glowingSpear: {
    text: t('weaponArmoireGlowingSpearText'),
    notes: t('weaponArmoireGlowingSpearNotes', { str: 15 }),
    value: 100,
    str: 15,
    canOwn: ownsItem('weapon_armoire_glowingSpear'),
  },
  barristerGavel: {
    text: t('weaponArmoireBarristerGavelText'),
    notes: t('weaponArmoireBarristerGavelNotes', { attrs: 5 }),
    value: 100,
    str: 5,
    con: 5,
    set: 'barrister',
    canOwn: ownsItem('weapon_armoire_barristerGavel'),
  },
  jesterBaton: {
    text: t('weaponArmoireJesterBatonText'),
    notes: t('weaponArmoireJesterBatonNotes', { attrs: 8 }),
    value: 100,
    int: 8,
    per: 8,
    set: 'jester',
    canOwn: ownsItem('weapon_armoire_jesterBaton'),
  },
  miningPickax: {
    text: t('weaponArmoireMiningPickaxText'),
    notes: t('weaponArmoireMiningPickaxNotes', { per: 15 }),
    value: 100,
    per: 15,
    set: 'miner',
    canOwn: ownsItem('weapon_armoire_miningPickax'),
  },
  basicLongbow: {
    text: t('weaponArmoireBasicLongbowText'),
    notes: t('weaponArmoireBasicLongbowNotes', { str: 6 }),
    value: 100,
    str: 6,
    twoHanded: true,
    set: 'basicArcher',
    canOwn: ownsItem('weapon_armoire_basicLongbow'),
  },
  habiticanDiploma: {
    text: t('weaponArmoireHabiticanDiplomaText'),
    notes: t('weaponArmoireHabiticanDiplomaNotes', { int: 11 }),
    value: 100,
    int: 11,
    set: 'graduate',
    canOwn: ownsItem('weapon_armoire_habiticanDiploma'),
  },
  sandySpade: {
    text: t('weaponArmoireSandySpadeText'),
    notes: t('weaponArmoireSandySpadeNotes', { str: 10 }),
    value: 100,
    str: 10,
    set: 'seaside',
    canOwn: ownsItem('weapon_armoire_sandySpade'),
  },
  cannon: {
    text: t('weaponArmoireCannonText'),
    notes: t('weaponArmoireCannonNotes', { str: 15 }),
    value: 100,
    str: 15,
    set: 'cannoneer',
    canOwn: ownsItem('weapon_armoire_cannon'),
  },
  vermilionArcherBow: {
    text: t('weaponArmoireVermilionArcherBowText'),
    notes: t('weaponArmoireVermilionArcherBowNotes', { str: 15 }),
    value: 100,
    str: 15,
    twoHanded: true,
    set: 'vermilionArcher',
    canOwn: ownsItem('weapon_armoire_vermilionArcherBow'),
  },
  ogreClub: {
    text: t('weaponArmoireOgreClubText'),
    notes: t('weaponArmoireOgreClubNotes', { str: 15 }),
    value: 100,
    str: 15,
    set: 'ogre',
    canOwn: ownsItem('weapon_armoire_ogreClub'),
  },
  woodElfStaff: {
    text: t('weaponArmoireWoodElfStaffText'),
    notes: t('weaponArmoireWoodElfStaffNotes', { int: 12 }),
    value: 100,
    int: 12,
    set: 'woodElf',
    canOwn: ownsItem('weapon_armoire_woodElfStaff'),
  },
  wandOfHearts: {
    text: t('weaponArmoireWandOfHeartsText'),
    notes: t('weaponArmoireWandOfHeartsNotes', { int: 13 }),
    value: 100,
    int: 13,
    set: 'queenOfHearts',
    canOwn: ownsItem('weapon_armoire_wandOfHearts'),
  },
  forestFungusStaff: {
    text: t('weaponArmoireForestFungusStaffText'),
    notes: t('weaponArmoireForestFungusStaffNotes', { int: 8, per: 9 }),
    value: 100,
    int: 8,
    per: 9,
    canOwn: ownsItem('weapon_armoire_forestFungusStaff'),
  },
  festivalFirecracker: {
    text: t('weaponArmoireFestivalFirecrackerText'),
    notes: t('weaponArmoireFestivalFirecrackerNotes', { per: 8 }),
    value: 100,
    per: 8,
    set: 'festivalAttire',
    canOwn: ownsItem('weapon_armoire_festivalFirecracker'),
  },
  merchantsDisplayTray: {
    text: t('weaponArmoireMerchantsDisplayTrayText'),
    notes: t('weaponArmoireMerchantsDisplayTrayNotes', { int: 10 }),
    value: 100,
    int: 10,
    set: 'merchant',
    canOwn: ownsItem('weapon_armoire_merchantsDisplayTray'),
  },
  battleAxe: {
    text: t('weaponArmoireBattleAxeText'),
    notes: t('weaponArmoireBattleAxeNotes', { int: 6, con: 8 }),
    value: 100,
    int: 6,
    con: 8,
    canOwn: ownsItem('weapon_armoire_battleAxe'),
  },
  hoofClippers: {
    text: t('weaponArmoireHoofClippersText'),
    notes: t('weaponArmoireHoofClippersNotes', { attrs: 6 }),
    value: 100,
    con: 6,
    int: 6,
    str: 6,
    set: 'farrier',
    canOwn: ownsItem('weapon_armoire_hoofClippers'),
  },
  weaversComb: {
    text: t('weaponArmoireWeaversCombText'),
    notes: t('weaponArmoireWeaversCombNotes', { per: 8, str: 9 }),
    value: 100,
    per: 8,
    str: 9,
    set: 'weaver',
    canOwn: ownsItem('weapon_armoire_weaversComb'),
  },
  lamplighter: {
    text: t('weaponArmoireLamplighterText'),
    notes: t('weaponArmoireLamplighterNotes', { per: 6, con: 8 }),
    value: 100,
    per: 6,
    con: 8,
    set: 'lamplighter',
    canOwn: ownsItem('weapon_armoire_lamplighter'),
  },
};

let armoireSet = {
  armor,
  body,
  eyewear,
  head,
  headAccessory,
  shield,
  weapon,
};

module.exports = armoireSet;
