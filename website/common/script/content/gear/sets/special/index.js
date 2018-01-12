import {
  EVENTS,
} from '../../../constants';
import { ownsItem } from '../../gear-helper';
import backerGear from './special-backer';
import contributorGear from './special-contributor';
import takeThisGear from './special-takeThis';
import wonderconGear from './special-wondercon';
import t from '../../../translation';

const CURRENT_SEASON = 'winter';

let armor = {
  0: backerGear.armorSpecial0,
  1: contributorGear.armorSpecial1,
  2: backerGear.armorSpecial2,
  takeThis: takeThisGear.armorSpecialTakeThis,
  finnedOceanicArmor: {
    text: t('armorSpecialFinnedOceanicArmorText'),
    notes: t('armorSpecialFinnedOceanicArmorNotes', { str: 15 }),
    str: 15,
    value: 130,
    canOwn: ownsItem('armor_special_finnedOceanicArmor'),
  },
  pyromancersRobes: {
    text: t('armorSpecialPyromancersRobesText'),
    notes: t('armorSpecialPyromancersRobesNotes', { con: 15 }),
    con: 15,
    value: 130,
    canOwn: ownsItem('armor_special_pyromancersRobes'),
  },
  bardRobes: {
    text: t('armorSpecialBardRobesText'),
    notes: t('armorSpecialBardRobesNotes', { per: 3 }),
    per: 3,
    value: 0,
    canOwn: ownsItem('armor_special_bardRobes'),
  },
  lunarWarriorArmor: {
    text: t('armorSpecialLunarWarriorArmorText'),
    notes: t('armorSpecialLunarWarriorArmorNotes', { attrs: 7 }),
    str: 7,
    con: 7,
    value: 130,
    canOwn: ownsItem('armor_special_lunarWarriorArmor'),
  },
  mammothRiderArmor: {
    text: t('armorSpecialMammothRiderArmorText'),
    notes: t('armorSpecialMammothRiderArmorNotes', { con: 15 }),
    con: 15,
    value: 130,
    canOwn: ownsItem('armor_special_mammothRiderArmor'),
  },
  roguishRainbowMessengerRobes: {
    text: t('armorSpecialRoguishRainbowMessengerRobesText'),
    notes: t('armorSpecialRoguishRainbowMessengerRobesNotes', { str: 15 }),
    str: 15,
    value: 130,
    canOwn: ownsItem('armor_special_roguishRainbowMessengerRobes'),
  },
  pageArmor: {
    text: t('armorSpecialPageArmorText'),
    notes: t('armorSpecialPageArmorNotes', { con: 16 }),
    con: 16,
    value: 0,
    canOwn: ownsItem('armor_special_pageArmor'),
  },
  sneakthiefRobes: {
    text: t('armorSpecialSneakthiefRobesText'),
    notes: t('armorSpecialSneakthiefRobesNotes', { int: 16 }),
    int: 16,
    value: 0,
    canOwn: ownsItem('armor_special_sneakthiefRobes'),
  },
  snowSovereignRobes: {
    text: t('armorSpecialSnowSovereignRobesText'),
    notes: t('armorSpecialSnowSovereignRobesNotes', { per: 17 }),
    per: 17,
    value: 0,
    canOwn: ownsItem('armor_special_snowSovereignRobes'),
  },
  dandySuit: {
    text: t('armorSpecialDandySuitText'),
    notes: t('armorSpecialDandySuitNotes', { per: 17 }),
    per: 17,
    value: 0,
    canOwn: ownsItem('armor_special_dandySuit'),
  },
  nomadsCuirass: {
    text: t('armorSpecialNomadsCuirassText'),
    notes: t('armorSpecialNomadsCuirassNotes', { con: 17 }),
    con: 17,
    value: 0,
    canOwn: ownsItem('armor_special_nomadsCuirass'),
  },
  samuraiArmor: {
    text: t('armorSpecialSamuraiArmorText'),
    notes: t('armorSpecialSamuraiArmorNotes', { per: 17 }),
    per: 17,
    value: 0,
    canOwn: ownsItem('armor_special_samuraiArmor'),
  },
  turkeyArmorBase: {
    text: t('armorSpecialTurkeyArmorBaseText'),
    notes: t('armorSpecialTurkeyArmorBaseNotes'),
    value: 0,
    canOwn: ownsItem('armor_special_turkeyArmorBase'),
  },
  yeti: {
    event: EVENTS.winter,
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('armorSpecialYetiText'),
    notes: t('armorSpecialYetiNotes', { con: 9 }),
    con: 9,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  ski: {
    event: EVENTS.winter,
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('armorSpecialSkiText'),
    notes: t('armorSpecialSkiNotes', { per: 15 }),
    per: 15,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  candycane: {
    event: EVENTS.winter,
    specialClass: 'wizard',
    set: 'candycaneSet',
    text: t('armorSpecialCandycaneText'),
    notes: t('armorSpecialCandycaneNotes', { int: 9 }),
    int: 9,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  snowflake: {
    event: EVENTS.winter,
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('armorSpecialSnowflakeText'),
    notes: t('armorSpecialSnowflakeNotes', { con: 15 }),
    con: 15,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  birthday: {
    event: EVENTS.birthday,
    text: t('armorSpecialBirthdayText'),
    notes: t('armorSpecialBirthdayNotes'), value: 0,
  },
  springRogue: {
    event: EVENTS.spring,
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('armorSpecialSpringRogueText'),
    notes: t('armorSpecialSpringRogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  springWarrior: {
    event: EVENTS.spring,
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('armorSpecialSpringWarriorText'),
    notes: t('armorSpecialSpringWarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  springMage: {
    event: EVENTS.spring,
    specialClass: 'wizard',
    set: 'magicMouseSet',
    text: t('armorSpecialSpringMageText'),
    notes: t('armorSpecialSpringMageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  springHealer: {
    event: EVENTS.spring,
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('armorSpecialSpringHealerText'),
    notes: t('armorSpecialSpringHealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  summerRogue: {
    event: EVENTS.summer,
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('armorSpecialSummerRogueText'),
    notes: t('armorSpecialSummerRogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerWarrior: {
    event: EVENTS.summer,
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('armorSpecialSummerWarriorText'),
    notes: t('armorSpecialSummerWarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerMage: {
    event: EVENTS.summer,
    specialClass: 'wizard',
    set: 'emeraldMermageSet',
    text: t('armorSpecialSummerMageText'),
    notes: t('armorSpecialSummerMageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerHealer: {
    event: EVENTS.summer,
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('armorSpecialSummerHealerText'),
    notes: t('armorSpecialSummerHealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fallRogue: {
    event: EVENTS.fall,
    specialClass: 'rogue',
    set: 'vampireSmiterSet',
    text: t('armorSpecialFallRogueText'),
    notes: t('armorSpecialFallRogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallWarrior: {
    event: EVENTS.fall,
    specialClass: 'warrior',
    set: 'monsterOfScienceSet',
    text: t('armorSpecialFallWarriorText'),
    notes: t('armorSpecialFallWarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallMage: {
    event: EVENTS.fall,
    specialClass: 'wizard',
    set: 'witchyWizardSet',
    text: t('armorSpecialFallMageText'),
    notes: t('armorSpecialFallMageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallHealer: {
    event: EVENTS.fall,
    specialClass: 'healer',
    set: 'mummyMedicSet',
    text: t('armorSpecialFallHealerText'),
    notes: t('armorSpecialFallHealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2015Rogue: {
    event: EVENTS.winter2015,
    specialClass: 'rogue',
    set: 'icicleDrakeSet',
    text: t('armorSpecialWinter2015RogueText'),
    notes: t('armorSpecialWinter2015RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Warrior: {
    event: EVENTS.winter2015,
    specialClass: 'warrior',
    set: 'gingerbreadSet',
    text: t('armorSpecialWinter2015WarriorText'),
    notes: t('armorSpecialWinter2015WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Mage: {
    event: EVENTS.winter2015,
    specialClass: 'wizard',
    set: 'northMageSet',
    text: t('armorSpecialWinter2015MageText'),
    notes: t('armorSpecialWinter2015MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Healer: {
    event: EVENTS.winter2015,
    specialClass: 'healer',
    set: 'soothingSkaterSet',
    text: t('armorSpecialWinter2015HealerText'),
    notes: t('armorSpecialWinter2015HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  birthday2015: {
    text: t('armorSpecialBirthday2015Text'),
    notes: t('armorSpecialBirthday2015Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2015'),
  },
  spring2015Rogue: {
    event: EVENTS.spring2015,
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('armorSpecialSpring2015RogueText'),
    notes: t('armorSpecialSpring2015RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  spring2015Warrior: {
    event: EVENTS.spring2015,
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('armorSpecialSpring2015WarriorText'),
    notes: t('armorSpecialSpring2015WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  spring2015Mage: {
    event: EVENTS.spring2015,
    specialClass: 'wizard',
    set: 'magicianBunnySet',
    text: t('armorSpecialSpring2015MageText'),
    notes: t('armorSpecialSpring2015MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  spring2015Healer: {
    event: EVENTS.spring2015,
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('armorSpecialSpring2015HealerText'),
    notes: t('armorSpecialSpring2015HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  summer2015Rogue: {
    event: EVENTS.summer2015,
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('armorSpecialSummer2015RogueText'),
    notes: t('armorSpecialSummer2015RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Warrior: {
    event: EVENTS.summer2015,
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('armorSpecialSummer2015WarriorText'),
    notes: t('armorSpecialSummer2015WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Mage: {
    event: EVENTS.summer2015,
    specialClass: 'wizard',
    set: 'shipSoothsayerSet',
    text: t('armorSpecialSummer2015MageText'),
    notes: t('armorSpecialSummer2015MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Healer: {
    event: EVENTS.summer2015,
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('armorSpecialSummer2015HealerText'),
    notes: t('armorSpecialSummer2015HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2015Rogue: {
    event: EVENTS.fall2015,
    specialClass: 'rogue',
    set: 'battleRogueSet',
    text: t('armorSpecialFall2015RogueText'),
    notes: t('armorSpecialFall2015RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Warrior: {
    event: EVENTS.fall2015,
    specialClass: 'warrior',
    set: 'scarecrowWarriorSet',
    text: t('armorSpecialFall2015WarriorText'),
    notes: t('armorSpecialFall2015WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Mage: {
    event: EVENTS.fall2015,
    specialClass: 'wizard',
    set: 'stitchWitchSet',
    text: t('armorSpecialFall2015MageText'),
    notes: t('armorSpecialFall2015MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Healer: {
    event: EVENTS.fall2015,
    specialClass: 'healer',
    set: 'potionerSet',
    text: t('armorSpecialFall2015HealerText'),
    notes: t('armorSpecialFall2015HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  gaymerx: {
    event: EVENTS.gaymerx,
    text: t('armorSpecialGaymerxText'),
    notes: t('armorSpecialGaymerxNotes'),
    value: 0,
  },
  winter2016Rogue: {
    event: EVENTS.winter2016,
    specialClass: 'rogue',
    set: 'cocoaSet',
    text: t('armorSpecialWinter2016RogueText'),
    notes: t('armorSpecialWinter2016RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Warrior: {
    event: EVENTS.winter2016,
    specialClass: 'warrior',
    set: 'snowDaySet',
    text: t('armorSpecialWinter2016WarriorText'),
    notes: t('armorSpecialWinter2016WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Mage: {
    event: EVENTS.winter2016,
    specialClass: 'wizard',
    set: 'snowboardingSet',
    text: t('armorSpecialWinter2016MageText'),
    notes: t('armorSpecialWinter2016MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Healer: {
    event: EVENTS.winter2016,
    specialClass: 'healer',
    set: 'festiveFairySet',
    text: t('armorSpecialWinter2016HealerText'),
    notes: t('armorSpecialWinter2016HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  birthday2016: {
    text: t('armorSpecialBirthday2016Text'),
    notes: t('armorSpecialBirthday2016Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2016'),
  },
  spring2016Rogue: {
    event: EVENTS.spring2016,
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('armorSpecialSpring2016RogueText'),
    notes: t('armorSpecialSpring2016RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  spring2016Warrior: {
    event: EVENTS.spring2016,
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('armorSpecialSpring2016WarriorText'),
    notes: t('armorSpecialSpring2016WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  spring2016Mage: {
    event: EVENTS.spring2016,
    specialClass: 'wizard',
    set: 'grandMalkinSet',
    text: t('armorSpecialSpring2016MageText'),
    notes: t('armorSpecialSpring2016MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  spring2016Healer: {
    event: EVENTS.spring2016,
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('armorSpecialSpring2016HealerText'),
    notes: t('armorSpecialSpring2016HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  summer2016Rogue: {
    event: EVENTS.summer2016,
    specialClass: 'rogue',
    set: 'summer2016EelSet',
    text: t('armorSpecialSummer2016RogueText'),
    notes: t('armorSpecialSummer2016RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Warrior: {
    event: EVENTS.summer2016,
    specialClass: 'warrior',
    set: 'summer2016SharkWarriorSet',
    text: t('armorSpecialSummer2016WarriorText'),
    notes: t('armorSpecialSummer2016WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Mage: {
    event: EVENTS.summer2016,
    specialClass: 'wizard',
    set: 'summer2016DolphinMageSet',
    text: t('armorSpecialSummer2016MageText'),
    notes: t('armorSpecialSummer2016MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Healer: {
    event: EVENTS.summer2016,
    specialClass: 'healer',
    set: 'summer2016SeahorseHealerSet',
    text: t('armorSpecialSummer2016HealerText'),
    notes: t('armorSpecialSummer2016HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2016Rogue: {
    event: EVENTS.fall2016,
    specialClass: 'rogue',
    set: 'fall2016BlackWidowSet',
    text: t('armorSpecialFall2016RogueText'),
    notes: t('armorSpecialFall2016RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Warrior: {
    event: EVENTS.fall2016,
    specialClass: 'warrior',
    set: 'fall2016SwampThingSet',
    text: t('armorSpecialFall2016WarriorText'),
    notes: t('armorSpecialFall2016WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Mage: {
    event: EVENTS.fall2016,
    specialClass: 'wizard',
    set: 'fall2016WickedSorcererSet',
    text: t('armorSpecialFall2016MageText'),
    notes: t('armorSpecialFall2016MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Healer: {
    event: EVENTS.fall2016,
    specialClass: 'healer',
    set: 'fall2016GorgonHealerSet',
    text: t('armorSpecialFall2016HealerText'),
    notes: t('armorSpecialFall2016HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2017Rogue: {
    event: EVENTS.winter2017,
    specialClass: 'rogue',
    set: 'winter2017FrostyRogueSet',
    text: t('armorSpecialWinter2017RogueText'),
    notes: t('armorSpecialWinter2017RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Warrior: {
    event: EVENTS.winter2017,
    specialClass: 'warrior',
    set: 'winter2017IceHockeySet',
    text: t('armorSpecialWinter2017WarriorText'),
    notes: t('armorSpecialWinter2017WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Mage: {
    event: EVENTS.winter2017,
    specialClass: 'wizard',
    set: 'winter2017WinterWolfSet',
    text: t('armorSpecialWinter2017MageText'),
    notes: t('armorSpecialWinter2017MageNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Healer: {
    event: EVENTS.winter2017,
    specialClass: 'healer',
    set: 'winter2017SugarPlumSet',
    text: t('armorSpecialWinter2017HealerText'),
    notes: t('armorSpecialWinter2017HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  birthday2017: {
    text: t('armorSpecialBirthday2017Text'),
    notes: t('armorSpecialBirthday2017Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2017'),
  },
  spring2017Rogue: {
    event: EVENTS.spring2017,
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('armorSpecialSpring2017RogueText'),
    notes: t('armorSpecialSpring2017RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  spring2017Warrior: {
    event: EVENTS.spring2017,
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('armorSpecialSpring2017WarriorText'),
    notes: t('armorSpecialSpring2017WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  spring2017Mage: {
    event: EVENTS.spring2017,
    specialClass: 'wizard',
    set: 'spring2017CanineConjurorSet',
    text: t('armorSpecialSpring2017MageText'),
    notes: t('armorSpecialSpring2017MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  spring2017Healer: {
    event: EVENTS.spring2017,
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('armorSpecialSpring2017HealerText'),
    notes: t('armorSpecialSpring2017HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  summer2017Rogue: {
    event: EVENTS.summer2017,
    specialClass: 'rogue',
    set: 'summer2017SeaDragonSet',
    text: t('armorSpecialSummer2017RogueText'),
    notes: t('armorSpecialSummer2017RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  summer2017Warrior: {
    event: EVENTS.summer2017,
    specialClass: 'warrior',
    set: 'summer2017SandcastleWarriorSet',
    text: t('armorSpecialSummer2017WarriorText'),
    notes: t('armorSpecialSummer2017WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  summer2017Mage: {
    event: EVENTS.summer2017,
    specialClass: 'wizard',
    set: 'summer2017WhirlpoolMageSet',
    text: t('armorSpecialSummer2017MageText'),
    notes: t('armorSpecialSummer2017MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  summer2017Healer: {
    event: EVENTS.summer2017,
    specialClass: 'healer',
    set: 'summer2017SeashellSeahealerSet',
    text: t('armorSpecialSummer2017HealerText'),
    notes: t('armorSpecialSummer2017HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  fall2017Rogue: {
    event: EVENTS.fall2017,
    specialClass: 'rogue',
    set: 'fall2017TrickOrTreatSet',
    text: t('armorSpecialFall2017RogueText'),
    notes: t('armorSpecialFall2017RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  fall2017Warrior: {
    event: EVENTS.fall2017,
    specialClass: 'warrior',
    set: 'fall2017HabitoweenSet',
    text: t('armorSpecialFall2017WarriorText'),
    notes: t('armorSpecialFall2017WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  fall2017Mage: {
    event: EVENTS.fall2017,
    specialClass: 'wizard',
    set: 'fall2017MasqueradeSet',
    text: t('armorSpecialFall2017MageText'),
    notes: t('armorSpecialFall2017MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  fall2017Healer: {
    event: EVENTS.fall2017,
    specialClass: 'healer',
    set: 'fall2017HauntedHouseSet',
    text: t('armorSpecialFall2017HealerText'),
    notes: t('armorSpecialFall2017HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
  winter2018Rogue: {
    event: EVENTS.winter2018,
    specialClass: 'rogue',
    set: 'winter2018ReindeerSet',
    text: t('armorSpecialWinter2018RogueText'),
    notes: t('armorSpecialWinter2018RogueNotes', { per: 15 }),
    value: 90,
    per: 15,
  },
  winter2018Warrior: {
    event: EVENTS.winter2018,
    specialClass: 'warrior',
    set: 'winter2018GiftWrappedSet',
    text: t('armorSpecialWinter2018WarriorText'),
    notes: t('armorSpecialWinter2018WarriorNotes', { con: 9 }),
    value: 90,
    con: 9,
  },
  winter2018Mage: {
    event: EVENTS.winter2018,
    specialClass: 'wizard',
    set: 'winter2018ConfettiSet',
    text: t('armorSpecialWinter2018MageText'),
    notes: t('armorSpecialWinter2018MageNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  winter2018Healer: {
    event: EVENTS.winter2018,
    specialClass: 'healer',
    set: 'winter2018MistletoeSet',
    text: t('armorSpecialWinter2018HealerText'),
    notes: t('armorSpecialWinter2018HealerNotes', { con: 15 }),
    value: 90,
    con: 15,
  },
};

let back = {
  wondercon_red: wonderconGear.backSpecialWonderconRed,  // eslint-disable-line camelcase
  wondercon_black: wonderconGear.backSpecialWonderconBlack,  // eslint-disable-line camelcase
  takeThis: takeThisGear.backSpecialTakeThis,
  snowdriftVeil: {
    text: t('backSpecialSnowdriftVeilText'),
    notes: t('backSpecialSnowdriftVeilNotes'),
    value: 0,
  },
  aetherCloak: {
    text: t('backSpecialAetherCloakText'),
    notes: t('backSpecialAetherCloakNotes', { per: 10 }),
    value: 175,
    per: 10,
    canOwn: ownsItem('back_special_aetherCloak'),
  },
  turkeyTailBase: {
    text: t('backSpecialTurkeyTailBaseText'),
    notes: t('backSpecialTurkeyTailBaseNotes'),
    value: 0,
    canOwn: ownsItem('back_special_turkeyTailBase'),
  },
};

let body = {
  wondercon_red: wonderconGear.bodySpecialWonderconRed,  // eslint-disable-line camelcase
  wondercon_gold: wonderconGear.bodySpecialWonderconGold,  // eslint-disable-line camelcase
  wondercon_black: wonderconGear.bodySpecialWonderconBlack,  // eslint-disable-line camelcase
  takeThis: takeThisGear.bodySpecialTakeThis,
  summerHealer: {
    event: EVENTS.summer,
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('bodySpecialSummerHealerText'),
    notes: t('bodySpecialSummerHealerNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerMage: {
    event: EVENTS.summer,
    specialClass: 'wizard',
    set: 'emeraldMermageSet',
    text: t('bodySpecialSummerMageText'),
    notes: t('bodySpecialSummerMageNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Healer: {
    event: EVENTS.summer2015,
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('bodySpecialSummer2015HealerText'),
    notes: t('bodySpecialSummer2015HealerNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Mage: {
    event: EVENTS.summer2015,
    specialClass: 'wizard',
    set: 'shipSoothsayerSet',
    text: t('bodySpecialSummer2015MageText'),
    notes: t('bodySpecialSummer2015MageNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Rogue: {
    event: EVENTS.summer2015,
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('bodySpecialSummer2015RogueText'),
    notes: t('bodySpecialSummer2015RogueNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Warrior: {
    event: EVENTS.summer2015,
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('bodySpecialSummer2015WarriorText'),
    notes: t('bodySpecialSummer2015WarriorNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  aetherAmulet: {
    text: t('bodySpecialAetherAmuletText'),
    notes: t('bodySpecialAetherAmuletNotes', { attrs: 10 }),
    value: 175,
    str: 10,
    con: 10,
    canOwn: ownsItem('body_special_aetherAmulet'),
  },
};

let eyewear = {
  wondercon_red: wonderconGear.eyewearSpecialWonderconRed,  // eslint-disable-line camelcase
  wondercon_black: wonderconGear.eyewearSpecialWonderconBlack,  // eslint-disable-line camelcase
  summerRogue: {
    event: EVENTS.summer,
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('eyewearSpecialSummerRogueText'),
    notes: t('eyewearSpecialSummerRogueNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerWarrior: {
    event: EVENTS.summer,
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('eyewearSpecialSummerWarriorText'),
    notes: t('eyewearSpecialSummerWarriorNotes'),
    value: 20,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  blackTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialBlackTopFrameText'),
    notes: t('eyewearSpecialBlackTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_blackTopFrame'),
  },
  blueTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialBlueTopFrameText'),
    notes: t('eyewearSpecialBlueTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_blueTopFrame'),
  },
  greenTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialGreenTopFrameText'),
    notes: t('eyewearSpecialGreenTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_greenTopFrame'),
  },
  pinkTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialPinkTopFrameText'),
    notes: t('eyewearSpecialPinkTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_pinkTopFrame'),
  },
  redTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialRedTopFrameText'),
    notes: t('eyewearSpecialRedTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_redTopFrame'),
  },
  whiteTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialWhiteTopFrameText'),
    notes: t('eyewearSpecialWhiteTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_whiteTopFrame'),
  },
  yellowTopFrame: {
    gearSet: 'glasses',
    text: t('eyewearSpecialYellowTopFrameText'),
    notes: t('eyewearSpecialYellowTopFrameNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_yellowTopFrame'),
  },
  aetherMask: {
    text: t('eyewearSpecialAetherMaskText'),
    notes: t('eyewearSpecialAetherMaskNotes', { int: 10 }),
    value: 175,
    int: 10,
    canOwn: ownsItem('eyewear_special_aetherMask'),
  },
};

let head = {
  0: backerGear.headSpecial0,
  1: contributorGear.headSpecial1,
  2: backerGear.headSpecial2,
  takeThis: takeThisGear.headSpecialTakeThis,
  fireCoralCirclet: {
    text: t('headSpecialFireCoralCircletText'),
    notes: t('headSpecialFireCoralCircletNotes', { per: 15 }),
    per: 15,
    value: 130,
    canOwn: ownsItem('head_special_fireCoralCirclet'),
  },
  pyromancersTurban: {
    text: t('headSpecialPyromancersTurbanText'),
    notes: t('headSpecialPyromancersTurbanNotes', { str: 15 }),
    str: 15,
    value: 130,
    canOwn: ownsItem('head_special_pyromancersTurban'),
  },
  bardHat: {
    text: t('headSpecialBardHatText'),
    notes: t('headSpecialBardHatNotes', { int: 3 }),
    int: 3,
    value: 0,
    canOwn: ownsItem('head_special_bardHat'),
  },
  lunarWarriorHelm: {
    text: t('headSpecialLunarWarriorHelmText'),
    notes: t('headSpecialLunarWarriorHelmNotes', { attrs: 7 }),
    int: 7,
    str: 7,
    value: 130,
    canOwn: ownsItem('head_special_lunarWarriorHelm'),
  },
  mammothRiderHelm: {
    text: t('headSpecialMammothRiderHelmText'),
    notes: t('headSpecialMammothRiderHelmNotes', { per: 15 }),
    per: 15,
    value: 130,
    canOwn: ownsItem('head_special_mammothRiderHelm'),
  },
  roguishRainbowMessengerHood: {
    text: t('headSpecialRoguishRainbowMessengerHoodText'),
    notes: t('headSpecialRoguishRainbowMessengerHoodNotes', { con: 15 }),
    con: 15,
    value: 130,
    canOwn: ownsItem('head_special_roguishRainbowMessengerHood'),
  },
  pageHelm: {
    text: t('headSpecialPageHelmText'),
    notes: t('headSpecialPageHelmNotes', { per: 16 }),
    per: 16,
    value: 0,
    canOwn: ownsItem('head_special_pageHelm'),
  },
  clandestineCowl: {
    text: t('headSpecialClandestineCowlText'),
    notes: t('headSpecialClandestineCowlNotes', { per: 16 }),
    per: 16,
    value: 0,
    canOwn: ownsItem('head_special_clandestineCowl'),
  },
  snowSovereignCrown: {
    text: t('headSpecialSnowSovereignCrownText'),
    notes: t('headSpecialSnowSovereignCrownNotes', { con: 16 }),
    con: 16,
    value: 0,
    canOwn: ownsItem('head_special_snowSovereignCrown'),
  },
  spikedHelm: {
    text: t('headSpecialSpikedHelmText'),
    notes: t('headSpecialSpikedHelmNotes', { str: 16 }),
    str: 16,
    value: 0,
    canOwn: ownsItem('head_special_spikedHelm'),
  },
  dandyHat: {
    text: t('headSpecialDandyHatText'),
    notes: t('headSpecialDandyHatNotes', { con: 17 }),
    con: 17,
    value: 0,
    canOwn: ownsItem('head_special_dandyHat'),
  },
  kabuto: {
    text: t('headSpecialKabutoText'),
    notes: t('headSpecialKabutoNotes', { int: 17 }),
    int: 17,
    value: 0,
    canOwn: ownsItem('head_special_kabuto'),
  },
  nye: {
    event: EVENTS.nye,
    text: t('headSpecialNyeText'),
    notes: t('headSpecialNyeNotes'),
    value: 0,
    canOwn: ownsItem('head_special_nye'),
  },
  turkeyHelmBase: {
    text: t('headSpecialTurkeyHelmBaseText'),
    notes: t('headSpecialTurkeyHelmBaseNotes'),
    value: 0,
    canOwn: ownsItem('head_special_turkeyHelmBase'),
  },
  yeti: {
    event: EVENTS.winter,
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('headSpecialYetiText'),
    notes: t('headSpecialYetiNotes', { str: 9 }),
    str: 9,
    value: 60,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  ski: {
    event: EVENTS.winter,
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('headSpecialSkiText'),
    notes: t('headSpecialSkiNotes', { per: 9 }),
    per: 9,
    value: 60,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  candycane: {
    event: EVENTS.winter,
    specialClass: 'wizard',
    set: 'candycaneSet',
    text: t('headSpecialCandycaneText'),
    notes: t('headSpecialCandycaneNotes', { per: 7 }),
    per: 7,
    value: 60,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  snowflake: {
    event: EVENTS.winter,
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('headSpecialSnowflakeText'),
    notes: t('headSpecialSnowflakeNotes', { int: 7 }),
    int: 7,
    value: 60,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  springRogue: {
    event: EVENTS.spring,
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('headSpecialSpringRogueText'),
    notes: t('headSpecialSpringRogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  springWarrior: {
    event: EVENTS.spring,
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('headSpecialSpringWarriorText'),
    notes: t('headSpecialSpringWarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  springMage: {
    event: EVENTS.spring,
    specialClass: 'wizard',
    set: 'magicMouseSet',
    text: t('headSpecialSpringMageText'),
    notes: t('headSpecialSpringMageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  springHealer: {
    event: EVENTS.spring,
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('headSpecialSpringHealerText'),
    notes: t('headSpecialSpringHealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  summerRogue: {
    event: EVENTS.summer,
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('headSpecialSummerRogueText'),
    notes: t('headSpecialSummerRogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerWarrior: {
    event: EVENTS.summer,
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('headSpecialSummerWarriorText'),
    notes: t('headSpecialSummerWarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerMage: {
    event: EVENTS.summer,
    specialClass: 'wizard',
    set: 'emeraldMermageSet',
    text: t('headSpecialSummerMageText'),
    notes: t('headSpecialSummerMageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerHealer: {
    event: EVENTS.summer,
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('headSpecialSummerHealerText'),
    notes: t('headSpecialSummerHealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fallRogue: {
    event: EVENTS.fall,
    specialClass: 'rogue',
    set: 'vampireSmiterSet',
    text: t('headSpecialFallRogueText'),
    notes: t('headSpecialFallRogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallWarrior: {
    event: EVENTS.fall,
    specialClass: 'warrior',
    set: 'monsterOfScienceSet',
    text: t('headSpecialFallWarriorText'),
    notes: t('headSpecialFallWarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallMage: {
    event: EVENTS.fall,
    specialClass: 'wizard',
    set: 'witchyWizardSet',
    text: t('headSpecialFallMageText'),
    notes: t('headSpecialFallMageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallHealer: {
    event: EVENTS.fall,
    specialClass: 'healer',
    set: 'mummyMedicSet',
    text: t('headSpecialFallHealerText'),
    notes: t('headSpecialFallHealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2015Rogue: {
    event: EVENTS.winter2015,
    specialClass: 'rogue',
    set: 'icicleDrakeSet',
    text: t('headSpecialWinter2015RogueText'),
    notes: t('headSpecialWinter2015RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Warrior: {
    event: EVENTS.winter2015,
    specialClass: 'warrior',
    set: 'gingerbreadSet',
    text: t('headSpecialWinter2015WarriorText'),
    notes: t('headSpecialWinter2015WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Mage: {
    event: EVENTS.winter2015,
    specialClass: 'wizard',
    set: 'northMageSet',
    text: t('headSpecialWinter2015MageText'),
    notes: t('headSpecialWinter2015MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Healer: {
    event: EVENTS.winter2015,
    specialClass: 'healer',
    set: 'soothingSkaterSet',
    text: t('headSpecialWinter2015HealerText'),
    notes: t('headSpecialWinter2015HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  nye2014: {
    text: t('headSpecialNye2014Text'),
    notes: t('headSpecialNye2014Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2014'),
  },
  spring2015Rogue: {
    event: EVENTS.spring2015,
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('headSpecialSpring2015RogueText'),
    notes: t('headSpecialSpring2015RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  spring2015Warrior: {
    event: EVENTS.spring2015,
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('headSpecialSpring2015WarriorText'),
    notes: t('headSpecialSpring2015WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  spring2015Mage: {
    event: EVENTS.spring2015,
    specialClass: 'wizard',
    set: 'magicianBunnySet',
    text: t('headSpecialSpring2015MageText'),
    notes: t('headSpecialSpring2015MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  spring2015Healer: {
    event: EVENTS.spring2015,
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('headSpecialSpring2015HealerText'),
    notes: t('headSpecialSpring2015HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  summer2015Rogue: {
    event: EVENTS.summer2015,
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('headSpecialSummer2015RogueText'),
    notes: t('headSpecialSummer2015RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Warrior: {
    event: EVENTS.summer2015,
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('headSpecialSummer2015WarriorText'),
    notes: t('headSpecialSummer2015WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Mage: {
    event: EVENTS.summer2015,
    specialClass: 'wizard',
    set: 'shipSoothsayerSet',
    text: t('headSpecialSummer2015MageText'),
    notes: t('headSpecialSummer2015MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Healer: {
    event: EVENTS.summer2015,
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('headSpecialSummer2015HealerText'),
    notes: t('headSpecialSummer2015HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2015Rogue: {
    event: EVENTS.fall2015,
    specialClass: 'rogue',
    set: 'battleRogueSet',
    text: t('headSpecialFall2015RogueText'),
    notes: t('headSpecialFall2015RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Warrior: {
    event: EVENTS.fall2015,
    specialClass: 'warrior',
    set: 'scarecrowWarriorSet',
    text: t('headSpecialFall2015WarriorText'),
    notes: t('headSpecialFall2015WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Mage: {
    event: EVENTS.fall2015,
    specialClass: 'wizard',
    set: 'stitchWitchSet',
    text: t('headSpecialFall2015MageText'),
    notes: t('headSpecialFall2015MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Healer: {
    event: EVENTS.fall2015,
    specialClass: 'healer',
    set: 'potionerSet',
    text: t('headSpecialFall2015HealerText'),
    notes: t('headSpecialFall2015HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  gaymerx: {
    event: EVENTS.gaymerx,
    text: t('headSpecialGaymerxText'),
    notes: t('headSpecialGaymerxNotes'),
    value: 0,
  },
  winter2016Rogue: {
    event: EVENTS.winter2016,
    specialClass: 'rogue',
    set: 'cocoaSet',
    text: t('headSpecialWinter2016RogueText'),
    notes: t('headSpecialWinter2016RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Warrior: {
    event: EVENTS.winter2016,
    specialClass: 'warrior',
    set: 'snowDaySet',
    text: t('headSpecialWinter2016WarriorText'),
    notes: t('headSpecialWinter2016WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Mage: {
    event: EVENTS.winter2016,
    specialClass: 'wizard',
    set: 'snowboardingSet',
    text: t('headSpecialWinter2016MageText'),
    notes: t('headSpecialWinter2016MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Healer: {
    event: EVENTS.winter2016,
    specialClass: 'healer',
    set: 'festiveFairySet',
    text: t('headSpecialWinter2016HealerText'),
    notes: t('headSpecialWinter2016HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  nye2015: {
    text: t('headSpecialNye2015Text'),
    notes: t('headSpecialNye2015Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2015'),
  },
  spring2016Rogue: {
    event: EVENTS.spring2016,
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('headSpecialSpring2016RogueText'),
    notes: t('headSpecialSpring2016RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  spring2016Warrior: {
    event: EVENTS.spring2016,
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('headSpecialSpring2016WarriorText'),
    notes: t('headSpecialSpring2016WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  spring2016Mage: {
    event: EVENTS.spring2016,
    specialClass: 'wizard',
    set: 'grandMalkinSet',
    text: t('headSpecialSpring2016MageText'),
    notes: t('headSpecialSpring2016MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  spring2016Healer: {
    event: EVENTS.spring2016,
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('headSpecialSpring2016HealerText'),
    notes: t('headSpecialSpring2016HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  summer2016Rogue: {
    event: EVENTS.summer2016,
    specialClass: 'rogue',
    set: 'summer2016EelSet',
    text: t('headSpecialSummer2016RogueText'),
    notes: t('headSpecialSummer2016RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Warrior: {
    event: EVENTS.summer2016,
    specialClass: 'warrior',
    set: 'summer2016SharkWarriorSet',
    text: t('headSpecialSummer2016WarriorText'),
    notes: t('headSpecialSummer2016WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Mage: {
    event: EVENTS.summer2016,
    specialClass: 'wizard',
    set: 'summer2016DolphinMageSet',
    text: t('headSpecialSummer2016MageText'),
    notes: t('headSpecialSummer2016MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Healer: {
    event: EVENTS.summer2016,
    specialClass: 'healer',
    set: 'summer2016SeahorseHealerSet',
    text: t('headSpecialSummer2016HealerText'),
    notes: t('headSpecialSummer2016HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2016Rogue: {
    event: EVENTS.fall2016,
    specialClass: 'rogue',
    set: 'fall2016BlackWidowSet',
    text: t('headSpecialFall2016RogueText'),
    notes: t('headSpecialFall2016RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Warrior: {
    event: EVENTS.fall2016,
    specialClass: 'warrior',
    set: 'fall2016SwampThingSet',
    text: t('headSpecialFall2016WarriorText'),
    notes: t('headSpecialFall2016WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Mage: {
    event: EVENTS.fall2016,
    specialClass: 'wizard',
    set: 'fall2016WickedSorcererSet',
    text: t('headSpecialFall2016MageText'),
    notes: t('headSpecialFall2016MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Healer: {
    event: EVENTS.fall2016,
    specialClass: 'healer',
    set: 'fall2016GorgonHealerSet',
    text: t('headSpecialFall2016HealerText'),
    notes: t('headSpecialFall2016HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2017Rogue: {
    event: EVENTS.winter2017,
    specialClass: 'rogue',
    set: 'winter2017FrostyRogueSet',
    text: t('headSpecialWinter2017RogueText'),
    notes: t('headSpecialWinter2017RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Warrior: {
    event: EVENTS.winter2017,
    specialClass: 'warrior',
    set: 'winter2017IceHockeySet',
    text: t('headSpecialWinter2017WarriorText'),
    notes: t('headSpecialWinter2017WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Mage: {
    event: EVENTS.winter2017,
    specialClass: 'wizard',
    set: 'winter2017WinterWolfSet',
    text: t('headSpecialWinter2017MageText'),
    notes: t('headSpecialWinter2017MageNotes', { per: 7 }),
    value: 60,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Healer: {
    event: EVENTS.winter2017,
    specialClass: 'healer',
    set: 'winter2017SugarPlumSet',
    text: t('headSpecialWinter2017HealerText'),
    notes: t('headSpecialWinter2017HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  nye2016: {
    text: t('headSpecialNye2016Text'),
    notes: t('headSpecialNye2016Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2016'),
  },
  spring2017Rogue: {
    event: EVENTS.spring2017,
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('headSpecialSpring2017RogueText'),
    notes: t('headSpecialSpring2017RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  spring2017Warrior: {
    event: EVENTS.spring2017,
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('headSpecialSpring2017WarriorText'),
    notes: t('headSpecialSpring2017WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  spring2017Mage: {
    event: EVENTS.spring2017,
    specialClass: 'wizard',
    set: 'spring2017CanineConjurorSet',
    text: t('headSpecialSpring2017MageText'),
    notes: t('headSpecialSpring2017MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  spring2017Healer: {
    event: EVENTS.spring2017,
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('headSpecialSpring2017HealerText'),
    notes: t('headSpecialSpring2017HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  summer2017Rogue: {
    event: EVENTS.summer2017,
    specialClass: 'rogue',
    set: 'summer2017SeaDragonSet',
    text: t('headSpecialSummer2017RogueText'),
    notes: t('headSpecialSummer2017RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  summer2017Warrior: {
    event: EVENTS.summer2017,
    specialClass: 'warrior',
    set: 'summer2017SandcastleWarriorSet',
    text: t('headSpecialSummer2017WarriorText'),
    notes: t('headSpecialSummer2017WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  summer2017Mage: {
    event: EVENTS.summer2017,
    specialClass: 'wizard',
    set: 'summer2017WhirlpoolMageSet',
    text: t('headSpecialSummer2017MageText'),
    notes: t('headSpecialSummer2017MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  summer2017Healer: {
    event: EVENTS.summer2017,
    specialClass: 'healer',
    set: 'summer2017SeashellSeahealerSet',
    text: t('headSpecialSummer2017HealerText'),
    notes: t('headSpecialSummer2017HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  namingDay2017: {
    text: t('headSpecialNamingDay2017Text'),
    notes: t('headSpecialNamingDay2017Notes'),
    value: 0,
    canOwn: ownsItem('head_special_namingDay2017'),
  },
  fall2017Rogue: {
    event: EVENTS.fall2017,
    specialClass: 'rogue',
    set: 'fall2017TrickOrTreatSet',
    text: t('headSpecialFall2017RogueText'),
    notes: t('headSpecialFall2017RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  fall2017Warrior: {
    event: EVENTS.fall2017,
    specialClass: 'warrior',
    set: 'fall2017HabitoweenSet',
    text: t('headSpecialFall2017WarriorText'),
    notes: t('headSpecialFall2017WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  fall2017Mage: {
    event: EVENTS.fall2017,
    specialClass: 'wizard',
    set: 'fall2017MasqueradeSet',
    text: t('headSpecialFall2017MageText'),
    notes: t('headSpecialFall2017MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  fall2017Healer: {
    event: EVENTS.fall2017,
    specialClass: 'healer',
    set: 'fall2017HauntedHouseSet',
    text: t('headSpecialFall2017HealerText'),
    notes: t('headSpecialFall2017HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
  nye2017: {
    text: t('headSpecialNye2017Text'),
    notes: t('headSpecialNye2017Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2017'),
  },
  winter2018Rogue: {
    event: EVENTS.winter2018,
    specialClass: 'rogue',
    set: 'winter2018ReindeerSet',
    text: t('headSpecialWinter2018RogueText'),
    notes: t('headSpecialWinter2018RogueNotes', { per: 9 }),
    value: 60,
    per: 9,
  },
  winter2018Warrior: {
    event: EVENTS.winter2018,
    specialClass: 'warrior',
    set: 'winter2018GiftWrappedSet',
    text: t('headSpecialWinter2018WarriorText'),
    notes: t('headSpecialWinter2018WarriorNotes', { str: 9 }),
    value: 60,
    str: 9,
  },
  winter2018Mage: {
    event: EVENTS.winter2018,
    specialClass: 'wizard',
    set: 'winter2018ConfettiSet',
    text: t('headSpecialWinter2018MageText'),
    notes: t('headSpecialWinter2018MageNotes', { per: 7 }),
    value: 60,
    per: 7,
  },
  winter2018Healer: {
    event: EVENTS.winter2018,
    specialClass: 'healer',
    set: 'winter2018MistletoeSet',
    text: t('headSpecialWinter2018HealerText'),
    notes: t('headSpecialWinter2018HealerNotes', { int: 7 }),
    value: 60,
    int: 7,
  },
};

let headAccessory = {
  springRogue: {
    event: EVENTS.spring,
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('headAccessorySpecialSpringRogueText'),
    notes: t('headAccessorySpecialSpringRogueNotes'),
    value: 20,
  },
  springWarrior: {
    event: EVENTS.spring,
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('headAccessorySpecialSpringWarriorText'),
    notes: t('headAccessorySpecialSpringWarriorNotes'),
    value: 20,
  },
  springMage: {
    event: EVENTS.spring,
    specialClass: 'wizard',
    set: 'magicMouseSet',
    text: t('headAccessorySpecialSpringMageText'),
    notes: t('headAccessorySpecialSpringMageNotes'),
    value: 20,
  },
  springHealer: {
    event: EVENTS.spring,
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('headAccessorySpecialSpringHealerText'),
    notes: t('headAccessorySpecialSpringHealerNotes'),
    value: 20,
  },
  spring2015Rogue: {
    event: EVENTS.spring2015,
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('headAccessorySpecialSpring2015RogueText'),
    notes: t('headAccessorySpecialSpring2015RogueNotes'),
    value: 20,
  },
  spring2015Warrior: {
    event: EVENTS.spring2015,
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('headAccessorySpecialSpring2015WarriorText'),
    notes: t('headAccessorySpecialSpring2015WarriorNotes'),
    value: 20,
  },
  spring2015Mage: {
    event: EVENTS.spring2015,
    specialClass: 'wizard',
    set: 'magicianBunnySet',
    text: t('headAccessorySpecialSpring2015MageText'),
    notes: t('headAccessorySpecialSpring2015MageNotes'),
    value: 20,
  },
  spring2015Healer: {
    event: EVENTS.spring2015,
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('headAccessorySpecialSpring2015HealerText'),
    notes: t('headAccessorySpecialSpring2015HealerNotes'),
    value: 20,
  },
  bearEars: {
    gearSet: 'animal',
    text: t('headAccessoryBearEarsText'),
    notes: t('headAccessoryBearEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_bearEars'),
    canBuy: () => {
      return true;
    },
  },
  cactusEars: {
    gearSet: 'animal',
    text: t('headAccessoryCactusEarsText'),
    notes: t('headAccessoryCactusEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_cactusEars'),
    canBuy: () => {
      return true;
    },
  },
  foxEars: {
    gearSet: 'animal',
    text: t('headAccessoryFoxEarsText'),
    notes: t('headAccessoryFoxEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_foxEars'),
    canBuy: () => {
      return true;
    },
  },
  lionEars: {
    gearSet: 'animal',
    text: t('headAccessoryLionEarsText'),
    notes: t('headAccessoryLionEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_lionEars'),
    canBuy: () => {
      return true;
    },
  },
  pandaEars: {
    gearSet: 'animal',
    text: t('headAccessoryPandaEarsText'),
    notes: t('headAccessoryPandaEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_pandaEars'),
    canBuy: () => {
      return true;
    },
  },
  pigEars: {
    gearSet: 'animal',
    text: t('headAccessoryPigEarsText'),
    notes: t('headAccessoryPigEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_pigEars'),
    canBuy: () => {
      return true;
    },
  },
  tigerEars: {
    gearSet: 'animal',
    text: t('headAccessoryTigerEarsText'),
    notes: t('headAccessoryTigerEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_tigerEars'),
    canBuy: () => {
      return true;
    },
  },
  wolfEars: {
    gearSet: 'animal',
    text: t('headAccessoryWolfEarsText'),
    notes: t('headAccessoryWolfEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_wolfEars'),
    canBuy: () => {
      return true;
    },
  },
  spring2016Rogue: {
    event: EVENTS.spring2016,
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('headAccessorySpecialSpring2016RogueText'),
    notes: t('headAccessorySpecialSpring2016RogueNotes'),
    value: 20,
  },
  spring2016Warrior: {
    event: EVENTS.spring2016,
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('headAccessorySpecialSpring2016WarriorText'),
    notes: t('headAccessorySpecialSpring2016WarriorNotes'),
    value: 20,
  },
  spring2016Mage: {
    event: EVENTS.spring2016,
    specialClass: 'wizard',
    set: 'grandMalkinSet',
    text: t('headAccessorySpecialSpring2016MageText'),
    notes: t('headAccessorySpecialSpring2016MageNotes'),
    value: 20,
  },
  spring2016Healer: {
    event: EVENTS.spring2016,
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('headAccessorySpecialSpring2016HealerText'),
    notes: t('headAccessorySpecialSpring2016HealerNotes'),
    value: 20,
  },
  spring2017Rogue: {
    event: EVENTS.spring2017,
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('headAccessorySpecialSpring2017RogueText'),
    notes: t('headAccessorySpecialSpring2017RogueNotes'),
    value: 20,
  },
  spring2017Warrior: {
    event: EVENTS.spring2017,
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('headAccessorySpecialSpring2017WarriorText'),
    notes: t('headAccessorySpecialSpring2017WarriorNotes'),
    value: 20,
  },
  spring2017Mage: {
    event: EVENTS.spring2017,
    specialClass: 'wizard',
    set: 'spring2017CanineConjurorSet',
    text: t('headAccessorySpecialSpring2017MageText'),
    notes: t('headAccessorySpecialSpring2017MageNotes'),
    value: 20,
  },
  spring2017Healer: {
    event: EVENTS.spring2017,
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('headAccessorySpecialSpring2017HealerText'),
    notes: t('headAccessorySpecialSpring2017HealerNotes'),
    value: 20,
  },
};

let shield = {
  0: backerGear.shieldSpecial0,
  1: contributorGear.shieldSpecial1,
  takeThis: takeThisGear.shieldSpecialTakeThis,
  goldenknight: {
    text: t('shieldSpecialGoldenknightText'),
    notes: t('shieldSpecialGoldenknightNotes', { attrs: 25 }),
    con: 25,
    per: 25,
    value: 200,
    canOwn: ownsItem('shield_special_goldenknight'),
  },
  moonpearlShield: {
    text: t('shieldSpecialMoonpearlShieldText'),
    notes: t('shieldSpecialMoonpearlShieldNotes', { con: 15 }),
    con: 15,
    value: 130,
    canOwn: ownsItem('shield_special_moonpearlShield'),
  },
  mammothRiderHorn: {
    text: t('shieldSpecialMammothRiderHornText'),
    notes: t('shieldSpecialMammothRiderHornNotes', { str: 15 }),
    str: 15,
    value: 130,
    canOwn: ownsItem('shield_special_mammothRiderHorn'),
  },
  roguishRainbowMessage: {
    text: t('shieldSpecialRoguishRainbowMessageText'),
    notes: t('shieldSpecialRoguishRainbowMessageNotes', { int: 15 }),
    int: 15,
    value: 130,
    canOwn: ownsItem('shield_special_roguishRainbowMessage'),
  },
  diamondStave: {
    text: t('shieldSpecialDiamondStaveText'),
    notes: t('shieldSpecialDiamondStaveNotes', { int: 16 }),
    int: 16,
    value: 0,
    canOwn: ownsItem('shield_special_diamondStave'),
  },
  lootBag: {
    text: t('shieldSpecialLootBagText'),
    notes: t('shieldSpecialLootBagNotes', { str: 16 }),
    str: 16,
    value: 0,
    canOwn: ownsItem('shield_special_lootBag'),
  },
  wintryMirror: {
    text: t('shieldSpecialWintryMirrorText'),
    notes: t('shieldSpecialWintryMirrorNotes', { int: 16 }),
    int: 16,
    value: 0,
    canOwn: ownsItem('shield_special_wintryMirror'),
  },
  wakizashi: {
    text: t('shieldSpecialWakizashiText'),
    notes: t('shieldSpecialWakizashiNotes', { con: 17 }),
    con: 17,
    value: 0,
    canOwn: ownsItem('shield_special_wakizashi'),
  },
  yeti: {
    event: EVENTS.winter,
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('shieldSpecialYetiText'),
    notes: t('shieldSpecialYetiNotes', { con: 7 }),
    con: 7,
    value: 70,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  ski: {
    event: EVENTS.winter,
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('weaponSpecialSkiText'),
    notes: t('weaponSpecialSkiNotes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  snowflake: {
    event: EVENTS.winter,
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('shieldSpecialSnowflakeText'),
    notes: t('shieldSpecialSnowflakeNotes', { con: 9 }),
    con: 9,
    value: 70,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  springRogue: {
    event: EVENTS.spring,
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('shieldSpecialSpringRogueText'),
    notes: t('shieldSpecialSpringRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  springWarrior: {
    event: EVENTS.spring,
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('shieldSpecialSpringWarriorText'),
    notes: t('shieldSpecialSpringWarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  springHealer: {
    event: EVENTS.spring,
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('shieldSpecialSpringHealerText'),
    notes: t('shieldSpecialSpringHealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  summerRogue: {
    event: EVENTS.summer,
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('shieldSpecialSummerRogueText'),
    notes: t('shieldSpecialSummerRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerWarrior: {
    event: EVENTS.summer,
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('shieldSpecialSummerWarriorText'),
    notes: t('shieldSpecialSummerWarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerHealer: {
    event: EVENTS.summer,
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('shieldSpecialSummerHealerText'),
    notes: t('shieldSpecialSummerHealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fallRogue: {
    event: EVENTS.fall,
    specialClass: 'rogue',
    set: 'vampireSmiterSet',
    text: t('shieldSpecialFallRogueText'),
    notes: t('shieldSpecialFallRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallWarrior: {
    event: EVENTS.fall,
    specialClass: 'warrior',
    set: 'monsterOfScienceSet',
    text: t('shieldSpecialFallWarriorText'),
    notes: t('shieldSpecialFallWarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallHealer: {
    event: EVENTS.fall,
    specialClass: 'healer',
    set: 'mummyMedicSet',
    text: t('shieldSpecialFallHealerText'),
    notes: t('shieldSpecialFallHealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2015Rogue: {
    event: EVENTS.winter2015,
    specialClass: 'rogue',
    set: 'icicleDrakeSet',
    text: t('shieldSpecialWinter2015RogueText'),
    notes: t('shieldSpecialWinter2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Warrior: {
    event: EVENTS.winter2015,
    specialClass: 'warrior',
    set: 'gingerbreadSet',
    text: t('shieldSpecialWinter2015WarriorText'),
    notes: t('shieldSpecialWinter2015WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Healer: {
    event: EVENTS.winter2015,
    specialClass: 'healer',
    set: 'soothingSkaterSet',
    text: t('shieldSpecialWinter2015HealerText'),
    notes: t('shieldSpecialWinter2015HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2015Rogue: {
    event: EVENTS.spring2015,
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('shieldSpecialSpring2015RogueText'),
    notes: t('shieldSpecialSpring2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2015Warrior: {
    event: EVENTS.spring2015,
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('shieldSpecialSpring2015WarriorText'),
    notes: t('shieldSpecialSpring2015WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  spring2015Healer: {
    event: EVENTS.spring2015,
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('shieldSpecialSpring2015HealerText'),
    notes: t('shieldSpecialSpring2015HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  summer2015Rogue: {
    event: EVENTS.summer2015,
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('shieldSpecialSummer2015RogueText'),
    notes: t('shieldSpecialSummer2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Warrior: {
    event: EVENTS.summer2015,
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('shieldSpecialSummer2015WarriorText'),
    notes: t('shieldSpecialSummer2015WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Healer: {
    event: EVENTS.summer2015,
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('shieldSpecialSummer2015HealerText'),
    notes: t('shieldSpecialSummer2015HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2015Rogue: {
    event: EVENTS.fall2015,
    specialClass: 'rogue',
    set: 'battleRogueSet',
    text: t('shieldSpecialFall2015RogueText'),
    notes: t('shieldSpecialFall2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Warrior: {
    event: EVENTS.fall2015,
    specialClass: 'warrior',
    set: 'scarecrowWarriorSet',
    text: t('shieldSpecialFall2015WarriorText'),
    notes: t('shieldSpecialFall2015WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Healer: {
    event: EVENTS.fall2015,
    specialClass: 'healer',
    set: 'potionerSet',
    text: t('shieldSpecialFall2015HealerText'),
    notes: t('shieldSpecialFall2015HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2016Rogue: {
    event: EVENTS.winter2016,
    specialClass: 'rogue',
    set: 'cocoaSet',
    text: t('shieldSpecialWinter2016RogueText'),
    notes: t('shieldSpecialWinter2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Warrior: {
    event: EVENTS.winter2016,
    specialClass: 'warrior',
    set: 'snowDaySet',
    text: t('shieldSpecialWinter2016WarriorText'),
    notes: t('shieldSpecialWinter2016WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Healer: {
    event: EVENTS.winter2016,
    specialClass: 'healer',
    set: 'festiveFairySet',
    text: t('shieldSpecialWinter2016HealerText'),
    notes: t('shieldSpecialWinter2016HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2016Rogue: {
    event: EVENTS.spring2016,
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('shieldSpecialSpring2016RogueText'),
    notes: t('shieldSpecialSpring2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2016Warrior: {
    event: EVENTS.spring2016,
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('shieldSpecialSpring2016WarriorText'),
    notes: t('shieldSpecialSpring2016WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  spring2016Healer: {
    event: EVENTS.spring2016,
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('shieldSpecialSpring2016HealerText'),
    notes: t('shieldSpecialSpring2016HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  summer2016Rogue: {
    event: EVENTS.summer2016,
    specialClass: 'rogue',
    set: 'summer2016EelSet',
    text: t('shieldSpecialSummer2016RogueText'),
    notes: t('shieldSpecialSummer2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Warrior: {
    event: EVENTS.summer2016,
    specialClass: 'warrior',
    set: 'summer2016SharkWarriorSet',
    text: t('shieldSpecialSummer2016WarriorText'),
    notes: t('shieldSpecialSummer2016WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Healer: {
    event: EVENTS.summer2016,
    specialClass: 'healer',
    set: 'summer2016SeahorseHealerSet',
    text: t('shieldSpecialSummer2016HealerText'),
    notes: t('shieldSpecialSummer2016HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2016Rogue: {
    event: EVENTS.fall2016,
    specialClass: 'rogue',
    set: 'fall2016BlackWidowSet',
    text: t('shieldSpecialFall2016RogueText'),
    notes: t('shieldSpecialFall2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Warrior: {
    event: EVENTS.fall2016,
    specialClass: 'warrior',
    set: 'fall2016SwampThingSet',
    text: t('shieldSpecialFall2016WarriorText'),
    notes: t('shieldSpecialFall2016WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Healer: {
    event: EVENTS.fall2016,
    specialClass: 'healer',
    set: 'fall2016GorgonHealerSet',
    text: t('shieldSpecialFall2016HealerText'),
    notes: t('shieldSpecialFall2016HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2017Rogue: {
    event: EVENTS.winter2017,
    specialClass: 'rogue',
    set: 'winter2017FrostyRogueSet',
    text: t('shieldSpecialWinter2017RogueText'),
    notes: t('shieldSpecialWinter2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Warrior: {
    event: EVENTS.winter2017,
    specialClass: 'warrior',
    set: 'winter2017IceHockeySet',
    text: t('shieldSpecialWinter2017WarriorText'),
    notes: t('shieldSpecialWinter2017WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Healer: {
    event: EVENTS.winter2017,
    specialClass: 'healer',
    set: 'winter2017SugarPlumSet',
    text: t('shieldSpecialWinter2017HealerText'),
    notes: t('shieldSpecialWinter2017HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2017Rogue: {
    event: EVENTS.spring2017,
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('shieldSpecialSpring2017RogueText'),
    notes: t('shieldSpecialSpring2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2017Warrior: {
    event: EVENTS.spring2017,
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('shieldSpecialSpring2017WarriorText'),
    notes: t('shieldSpecialSpring2017WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  spring2017Healer: {
    event: EVENTS.spring2017,
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('shieldSpecialSpring2017HealerText'),
    notes: t('shieldSpecialSpring2017HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  summer2017Rogue: {
    event: EVENTS.summer2017,
    specialClass: 'rogue',
    set: 'summer2017SeaDragonSet',
    text: t('shieldSpecialSummer2017RogueText'),
    notes: t('shieldSpecialSummer2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  summer2017Warrior: {
    event: EVENTS.summer2017,
    specialClass: 'warrior',
    set: 'summer2017SandcastleWarriorSet',
    text: t('shieldSpecialSummer2017WarriorText'),
    notes: t('shieldSpecialSummer2017WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  summer2017Healer: {
    event: EVENTS.summer2017,
    specialClass: 'healer',
    set: 'summer2017SeashellSeahealerSet',
    text: t('shieldSpecialSummer2017HealerText'),
    notes: t('shieldSpecialSummer2017HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  fall2017Rogue: {
    event: EVENTS.fall2017,
    specialClass: 'rogue',
    set: 'fall2017TrickOrTreatSet',
    text: t('shieldSpecialFall2017RogueText'),
    notes: t('shieldSpecialFall2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  fall2017Warrior: {
    event: EVENTS.fall2017,
    specialClass: 'warrior',
    set: 'fall2017HabitoweenSet',
    text: t('shieldSpecialFall2017WarriorText'),
    notes: t('shieldSpecialFall2017WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  fall2017Healer: {
    event: EVENTS.fall2017,
    specialClass: 'healer',
    set: 'fall2017HauntedHouseSet',
    text: t('shieldSpecialFall2017HealerText'),
    notes: t('shieldSpecialFall2017HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
  winter2018Rogue: {
    event: EVENTS.winter2018,
    specialClass: 'rogue',
    set: 'winter2018ReindeerSet',
    text: t('shieldSpecialWinter2018RogueText'),
    notes: t('shieldSpecialWinter2018RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  winter2018Warrior: {
    event: EVENTS.winter2018,
    specialClass: 'warrior',
    set: 'winter2018GiftWrappedSet',
    text: t('shieldSpecialWinter2018WarriorText'),
    notes: t('shieldSpecialWinter2018WarriorNotes', { con: 7 }),
    value: 70,
    con: 7,
  },
  winter2018Healer: {
    event: EVENTS.winter2018,
    specialClass: 'healer',
    set: 'winter2018MistletoeSet',
    text: t('shieldSpecialWinter2018HealerText'),
    notes: t('shieldSpecialWinter2018HealerNotes', { con: 9 }),
    value: 70,
    con: 9,
  },
};

let weapon = {
  0: backerGear.weaponSpecial0,
  1: contributorGear.weaponSpecial1,
  2: backerGear.weaponSpecial2,
  3: backerGear.weaponSpecial3,
  critical: contributorGear.weaponSpecialCritical,
  takeThis: takeThisGear.weaponSpecialTakeThis,
  tridentOfCrashingTides: {
    text: t('weaponSpecialTridentOfCrashingTidesText'),
    notes: t('weaponSpecialTridentOfCrashingTidesNotes', { int: 15 }),
    int: 15,
    value: 130,
    canOwn: ownsItem('weapon_special_tridentOfCrashingTides'),
  },
  taskwoodsLantern: {
    text: t('weaponSpecialTaskwoodsLanternText'),
    notes: t('weaponSpecialTaskwoodsLanternNotes', { attrs: 15 }),
    twoHanded: true,
    per: 15,
    int: 15,
    value: 130,
    canOwn: ownsItem('weapon_special_taskwoodsLantern'),
  },
  bardInstrument: {
    text: t('weaponSpecialBardInstrumentText'),
    notes: t('weaponSpecialBardInstrumentNotes', { attrs: 4 }),
    twoHanded: true,
    per: 4,
    int: 4,
    value: 0,
    canOwn: ownsItem('weapon_special_bardInstrument'),
  },
  lunarScythe: {
    text: t('weaponSpecialLunarScytheText'),
    notes: t('weaponSpecialLunarScytheNotes', { attrs: 7 }),
    twoHanded: true,
    str: 7,
    per: 7,
    value: 130,
    canOwn: ownsItem('weapon_special_lunarScythe'),
  },
  mammothRiderSpear: {
    text: t('weaponSpecialMammothRiderSpearText'),
    notes: t('weaponSpecialMammothRiderSpearNotes', { int: 15 }),
    int: 15,
    value: 130,
    canOwn: ownsItem('weapon_special_mammothRiderSpear'),
  },
  roguishRainbowMessage: {
    text: t('weaponSpecialRoguishRainbowMessageText'),
    notes: t('weaponSpecialRoguishRainbowMessageNotes', { per: 15 }),
    per: 15,
    value: 130,
    canOwn: ownsItem('weapon_special_roguishRainbowMessage'),
  },
  pageBanner: {
    text: t('weaponSpecialPageBannerText'),
    notes: t('weaponSpecialPageBannerNotes', { str: 16 }),
    str: 16,
    value: 0,
    canOwn: ownsItem('weapon_special_pageBanner'),
  },
  skeletonKey: {
    text: t('weaponSpecialSkeletonKeyText'),
    notes: t('weaponSpecialSkeletonKeyNotes', { con: 16 }),
    con: 16,
    value: 0,
    canOwn: ownsItem('weapon_special_skeletonKey'),
  },
  nomadsScimitar: {
    text: t('weaponSpecialNomadsScimitarText'),
    notes: t('weaponSpecialNomadsScimitarNotes', { int: 16 }),
    int: 16,
    value: 0,
    canOwn: ownsItem('weapon_special_nomadsScimitar'),
  },
  fencingFoil: {
    text: t('weaponSpecialFencingFoilText'),
    notes: t('weaponSpecialFencingFoilNotes', { str: 16 }),
    str: 16,
    value: 0,
    canOwn: ownsItem('weapon_special_fencingFoil'),
  },
  tachi: {
    text: t('weaponSpecialTachiText'),
    notes: t('weaponSpecialTachiNotes', { str: 17 }),
    str: 17,
    value: 0,
    canOwn: ownsItem('weapon_special_tachi'),
  },
  aetherCrystals: {
    text: t('weaponSpecialAetherCrystalsText'),
    notes: t('weaponSpecialAetherCrystalsNotes', { attrs: 10 }),
    con: 10,
    int: 10,
    per: 10,
    str: 10,
    value: 175,
    twoHanded: true,
    canOwn: ownsItem('weapon_special_aetherCrystals'),
  },
  yeti: {
    event: EVENTS.winter,
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('weaponSpecialYetiText'),
    notes: t('weaponSpecialYetiNotes', { str: 15 }),
    str: 15,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  ski: {
    event: EVENTS.winter,
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('weaponSpecialSkiText'),
    notes: t('weaponSpecialSkiNotes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  candycane: {
    event: EVENTS.winter,
    specialClass: 'wizard',
    set: 'candycaneSet',
    twoHanded: true,
    text: t('weaponSpecialCandycaneText'),
    notes: t('weaponSpecialCandycaneNotes', { int: 15, per: 7 }),
    int: 15,
    per: 7,
    value: 160,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  snowflake: {
    event: EVENTS.winter,
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('weaponSpecialSnowflakeText'),
    notes: t('weaponSpecialSnowflakeNotes', { int: 9 }),
    int: 9,
    value: 90,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  springRogue: {
    event: EVENTS.spring,
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('weaponSpecialSpringRogueText'),
    notes: t('weaponSpecialSpringRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  springWarrior: {
    event: EVENTS.spring,
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('weaponSpecialSpringWarriorText'),
    notes: t('weaponSpecialSpringWarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  springMage: {
    event: EVENTS.spring,
    specialClass: 'wizard',
    set: 'magicMouseSet',
    twoHanded: true,
    text: t('weaponSpecialSpringMageText'),
    notes: t('weaponSpecialSpringMageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  springHealer: {
    event: EVENTS.spring,
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('weaponSpecialSpringHealerText'),
    notes: t('weaponSpecialSpringHealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  summerRogue: {
    event: EVENTS.summer,
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('weaponSpecialSummerRogueText'),
    notes: t('weaponSpecialSummerRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerWarrior: {
    event: EVENTS.summer,
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('weaponSpecialSummerWarriorText'),
    notes: t('weaponSpecialSummerWarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerMage: {
    event: EVENTS.summer,
    specialClass: 'wizard',
    set: 'emeraldMermageSet',
    twoHanded: true,
    text: t('weaponSpecialSummerMageText'),
    notes: t('weaponSpecialSummerMageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summerHealer: {
    event: EVENTS.summer,
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('weaponSpecialSummerHealerText'),
    notes: t('weaponSpecialSummerHealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fallRogue: {
    event: EVENTS.fall,
    specialClass: 'rogue',
    set: 'vampireSmiterSet',
    text: t('weaponSpecialFallRogueText'),
    notes: t('weaponSpecialFallRogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallWarrior: {
    event: EVENTS.fall,
    specialClass: 'warrior',
    set: 'monsterOfScienceSet',
    text: t('weaponSpecialFallWarriorText'),
    notes: t('weaponSpecialFallWarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallMage: {
    event: EVENTS.fall,
    specialClass: 'wizard',
    set: 'witchyWizardSet',
    twoHanded: true,
    text: t('weaponSpecialFallMageText'),
    notes: t('weaponSpecialFallMageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fallHealer: {
    event: EVENTS.fall,
    specialClass: 'healer',
    set: 'mummyMedicSet',
    text: t('weaponSpecialFallHealerText'),
    notes: t('weaponSpecialFallHealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2015Rogue: {
    event: EVENTS.winter2015,
    specialClass: 'rogue',
    set: 'icicleDrakeSet',
    text: t('weaponSpecialWinter2015RogueText'),
    notes: t('weaponSpecialWinter2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Warrior: {
    event: EVENTS.winter2015,
    specialClass: 'warrior',
    set: 'gingerbreadSet',
    text: t('weaponSpecialWinter2015WarriorText'),
    notes: t('weaponSpecialWinter2015WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Mage: {
    event: EVENTS.winter2015,
    specialClass: 'wizard',
    set: 'northMageSet',
    twoHanded: true,
    text: t('weaponSpecialWinter2015MageText'),
    notes: t('weaponSpecialWinter2015MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2015Healer: {
    event: EVENTS.winter2015,
    specialClass: 'healer',
    set: 'soothingSkaterSet',
    text: t('weaponSpecialWinter2015HealerText'),
    notes: t('weaponSpecialWinter2015HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2015Rogue: {
    event: EVENTS.spring2015,
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('weaponSpecialSpring2015RogueText'),
    notes: t('weaponSpecialSpring2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2015Warrior: {
    event: EVENTS.spring2015,
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('weaponSpecialSpring2015WarriorText'),
    notes: t('weaponSpecialSpring2015WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  spring2015Mage: {
    event: EVENTS.spring2015,
    specialClass: 'wizard',
    set: 'magicianBunnySet',
    twoHanded: true,
    text: t('weaponSpecialSpring2015MageText'),
    notes: t('weaponSpecialSpring2015MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  spring2015Healer: {
    event: EVENTS.spring2015,
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('weaponSpecialSpring2015HealerText'),
    notes: t('weaponSpecialSpring2015HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  summer2015Rogue: {
    event: EVENTS.summer2015,
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('weaponSpecialSummer2015RogueText'),
    notes: t('weaponSpecialSummer2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Warrior: {
    event: EVENTS.summer2015,
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('weaponSpecialSummer2015WarriorText'),
    notes: t('weaponSpecialSummer2015WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Mage: {
    event: EVENTS.summer2015,
    specialClass: 'wizard',
    set: 'shipSoothsayerSet',
    twoHanded: true,
    text: t('weaponSpecialSummer2015MageText'),
    notes: t('weaponSpecialSummer2015MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2015Healer: {
    event: EVENTS.summer2015,
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('weaponSpecialSummer2015HealerText'),
    notes: t('weaponSpecialSummer2015HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2015Rogue: {
    event: EVENTS.fall2015,
    specialClass: 'rogue',
    set: 'battleRogueSet',
    text: t('weaponSpecialFall2015RogueText'),
    notes: t('weaponSpecialFall2015RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Warrior: {
    event: EVENTS.fall2015,
    specialClass: 'warrior',
    set: 'scarecrowWarriorSet',
    text: t('weaponSpecialFall2015WarriorText'),
    notes: t('weaponSpecialFall2015WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Mage: {
    event: EVENTS.fall2015,
    specialClass: 'wizard',
    set: 'stitchWitchSet',
    twoHanded: true,
    text: t('weaponSpecialFall2015MageText'),
    notes: t('weaponSpecialFall2015MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2015Healer: {
    event: EVENTS.fall2015,
    specialClass: 'healer',
    set: 'potionerSet',
    text: t('weaponSpecialFall2015HealerText'),
    notes: t('weaponSpecialFall2015HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2016Rogue: {
    event: EVENTS.winter2016,
    specialClass: 'rogue',
    set: 'cocoaSet',
    text: t('weaponSpecialWinter2016RogueText'),
    notes: t('weaponSpecialWinter2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Warrior: {
    event: EVENTS.winter2016,
    specialClass: 'warrior',
    set: 'snowDaySet',
    text: t('weaponSpecialWinter2016WarriorText'),
    notes: t('weaponSpecialWinter2016WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Mage: {
    event: EVENTS.winter2016,
    specialClass: 'wizard',
    set: 'snowboardingSet',
    twoHanded: true,
    text: t('weaponSpecialWinter2016MageText'),
    notes: t('weaponSpecialWinter2016MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2016Healer: {
    event: EVENTS.winter2016,
    specialClass: 'healer',
    set: 'festiveFairySet',
    text: t('weaponSpecialWinter2016HealerText'),
    notes: t('weaponSpecialWinter2016HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2016Rogue: {
    event: EVENTS.spring2016,
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('weaponSpecialSpring2016RogueText'),
    notes: t('weaponSpecialSpring2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2016Warrior: {
    event: EVENTS.spring2016,
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('weaponSpecialSpring2016WarriorText'),
    notes: t('weaponSpecialSpring2016WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  spring2016Mage: {
    event: EVENTS.spring2016,
    specialClass: 'wizard',
    set: 'grandMalkinSet',
    twoHanded: true,
    text: t('weaponSpecialSpring2016MageText'),
    notes: t('weaponSpecialSpring2016MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  spring2016Healer: {
    event: EVENTS.spring2016,
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('weaponSpecialSpring2016HealerText'),
    notes: t('weaponSpecialSpring2016HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  summer2016Rogue: {
    event: EVENTS.summer2016,
    specialClass: 'rogue',
    set: 'summer2016EelSet',
    text: t('weaponSpecialSummer2016RogueText'),
    notes: t('weaponSpecialSummer2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Warrior: {
    event: EVENTS.summer2016,
    specialClass: 'warrior',
    set: 'summer2016SharkWarriorSet',
    text: t('weaponSpecialSummer2016WarriorText'),
    notes: t('weaponSpecialSummer2016WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Mage: {
    event: EVENTS.summer2016,
    specialClass: 'wizard',
    set: 'summer2016DolphinMageSet',
    twoHanded: true,
    text: t('weaponSpecialSummer2016MageText'),
    notes: t('weaponSpecialSummer2016MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  summer2016Healer: {
    event: EVENTS.summer2016,
    specialClass: 'healer',
    set: 'summer2016SeahorseHealerSet',
    text: t('weaponSpecialSummer2016HealerText'),
    notes: t('weaponSpecialSummer2016HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'summer';
    },
  },
  fall2016Rogue: {
    event: EVENTS.fall2016,
    specialClass: 'rogue',
    set: 'fall2016BlackWidowSet',
    text: t('weaponSpecialFall2016RogueText'),
    notes: t('weaponSpecialFall2016RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Warrior: {
    event: EVENTS.fall2016,
    specialClass: 'warrior',
    set: 'fall2016SwampThingSet',
    text: t('weaponSpecialFall2016WarriorText'),
    notes: t('weaponSpecialFall2016WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Mage: {
    event: EVENTS.fall2016,
    specialClass: 'wizard',
    set: 'fall2016WickedSorcererSet',
    twoHanded: true,
    text: t('weaponSpecialFall2016MageText'),
    notes: t('weaponSpecialFall2016MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  fall2016Healer: {
    event: EVENTS.fall2016,
    specialClass: 'healer',
    set: 'fall2016GorgonHealerSet',
    text: t('weaponSpecialFall2016HealerText'),
    notes: t('weaponSpecialFall2016HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'fall';
    },
  },
  winter2017Rogue: {
    event: EVENTS.winter2017,
    specialClass: 'rogue',
    set: 'winter2017FrostyRogueSet',
    text: t('weaponSpecialWinter2017RogueText'),
    notes: t('weaponSpecialWinter2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Warrior: {
    event: EVENTS.winter2017,
    specialClass: 'warrior',
    set: 'winter2017IceHockeySet',
    text: t('weaponSpecialWinter2017WarriorText'),
    notes: t('weaponSpecialWinter2017WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Mage: {
    event: EVENTS.winter2017,
    specialClass: 'wizard',
    set: 'winter2017WinterWolfSet',
    twoHanded: true,
    text: t('weaponSpecialWinter2017MageText'),
    notes: t('weaponSpecialWinter2017MageNotes', { int: 15, per: 7 }),
    value: 170,
    int: 15,
    per: 7,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  winter2017Healer: {
    event: EVENTS.winter2017,
    specialClass: 'healer',
    set: 'winter2017SugarPlumSet',
    text: t('weaponSpecialWinter2017HealerText'),
    notes: t('weaponSpecialWinter2017HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
    canBuy: () => {
      return CURRENT_SEASON === 'winter';
    },
  },
  spring2017Rogue: {
    event: EVENTS.spring2017,
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('weaponSpecialSpring2017RogueText'),
    notes: t('weaponSpecialSpring2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  spring2017Warrior: {
    event: EVENTS.spring2017,
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('weaponSpecialSpring2017WarriorText'),
    notes: t('weaponSpecialSpring2017WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  spring2017Mage: {
    event: EVENTS.spring2017,
    specialClass: 'wizard',
    set: 'spring2017CanineConjurorSet',
    twoHanded: true,
    text: t('weaponSpecialSpring2017MageText'),
    notes: t('weaponSpecialSpring2017MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  spring2017Healer: {
    event: EVENTS.spring2017,
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('weaponSpecialSpring2017HealerText'),
    notes: t('weaponSpecialSpring2017HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  summer2017Rogue: {
    event: EVENTS.summer2017,
    specialClass: 'rogue',
    set: 'summer2017SeaDragonSet',
    text: t('weaponSpecialSummer2017RogueText'),
    notes: t('weaponSpecialSummer2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  summer2017Warrior: {
    event: EVENTS.summer2017,
    specialClass: 'warrior',
    set: 'summer2017SandcastleWarriorSet',
    text: t('weaponSpecialSummer2017WarriorText'),
    notes: t('weaponSpecialSummer2017WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  summer2017Mage: {
    event: EVENTS.summer2017,
    specialClass: 'wizard',
    set: 'summer2017WhirlpoolMageSet',
    twoHanded: true,
    text: t('weaponSpecialSummer2017MageText'),
    notes: t('weaponSpecialSummer2017MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  summer2017Healer: {
    event: EVENTS.summer2017,
    specialClass: 'healer',
    set: 'summer2017SeashellSeahealerSet',
    text: t('weaponSpecialSummer2017HealerText'),
    notes: t('weaponSpecialSummer2017HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  fall2017Rogue: {
    event: EVENTS.fall2017,
    specialClass: 'rogue',
    set: 'fall2017TrickOrTreatSet',
    text: t('weaponSpecialFall2017RogueText'),
    notes: t('weaponSpecialFall2017RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  fall2017Warrior: {
    event: EVENTS.fall2017,
    specialClass: 'warrior',
    set: 'fall2017HabitoweenSet',
    text: t('weaponSpecialFall2017WarriorText'),
    notes: t('weaponSpecialFall2017WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  fall2017Mage: {
    event: EVENTS.fall2017,
    specialClass: 'wizard',
    set: 'fall2017MasqueradeSet',
    twoHanded: true,
    text: t('weaponSpecialFall2017MageText'),
    notes: t('weaponSpecialFall2017MageNotes', { int: 15, per: 7 }),
    value: 160,
    int: 15,
    per: 7,
  },
  fall2017Healer: {
    event: EVENTS.fall2017,
    specialClass: 'healer',
    set: 'fall2017HauntedHouseSet',
    text: t('weaponSpecialFall2017HealerText'),
    notes: t('weaponSpecialFall2017HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
  winter2018Rogue: {
    event: EVENTS.winter2018,
    specialClass: 'rogue',
    set: 'winter2018ReindeerSet',
    text: t('weaponSpecialWinter2018RogueText'),
    notes: t('weaponSpecialWinter2018RogueNotes', { str: 8 }),
    value: 80,
    str: 8,
  },
  winter2018Warrior: {
    event: EVENTS.winter2018,
    specialClass: 'warrior',
    set: 'winter2018GiftWrappedSet',
    text: t('weaponSpecialWinter2018WarriorText'),
    notes: t('weaponSpecialWinter2018WarriorNotes', { str: 15 }),
    value: 90,
    str: 15,
  },
  winter2018Mage: {
    event: EVENTS.winter2018,
    specialClass: 'wizard',
    set: 'winter2018ConfettiSet',
    twoHanded: true,
    text: t('weaponSpecialWinter2018MageText'),
    notes: t('weaponSpecialWinter2018MageNotes', { int: 15, per: 7 }),
    value: 170,
    int: 15,
    per: 7,
  },
  winter2018Healer: {
    event: EVENTS.winter2018,
    specialClass: 'healer',
    set: 'winter2018MistletoeSet',
    text: t('weaponSpecialWinter2018HealerText'),
    notes: t('weaponSpecialWinter2018HealerNotes', { int: 9 }),
    value: 90,
    int: 9,
  },
};

let specialSet = {
  armor,
  back,
  body,
  eyewear,
  head,
  headAccessory,
  shield,
  weapon,
};

module.exports = specialSet;
