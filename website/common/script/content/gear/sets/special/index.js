import moment from 'moment';
import pickBy from 'lodash/pickBy';
import defaults from 'lodash/defaults';
import find from 'lodash/find';
import upperFirst from 'lodash/upperFirst';
import {
  CLASSES,
  EVENTS,
} from '../../../constants';
import { ownsItem } from '../../gear-helper';
import * as backerGear from './special-backer';
import * as contributorGear from './special-contributor';
import * as takeThisGear from './special-takeThis';
import * as wonderconGear from './special-wondercon';
import t from '../../../translation';
import { getClassName } from '../../../../libs/getClassName';

const CURRENT_EVENT = find(
  EVENTS, event => moment().isBetween(event.start, event.end)
    && ['winter', 'spring', 'summer', 'fall'].includes(event.season),
);

const gearEvents = pickBy(EVENTS, event => event.gear);

const armor = {
  0: backerGear.armorSpecial0,
  1: contributorGear.armorSpecial1,
  2: backerGear.armorSpecial2,
  takeThis: takeThisGear.armorSpecialTakeThis,
  heroicTunic: contributorGear.armorSpecialHeroicTunic,
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
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('armorSpecialYetiText'),
    notes: t('armorSpecialYetiNotes', { con: 9 }),
    con: 9,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  ski: {
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('armorSpecialSkiText'),
    notes: t('armorSpecialSkiNotes', { per: 15 }),
    per: 15,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  candycane: {
    specialClass: 'wizard',
    set: 'candycaneSet',
    text: t('armorSpecialCandycaneText'),
    notes: t('armorSpecialCandycaneNotes', { int: 9 }),
    int: 9,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  snowflake: {
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('armorSpecialSnowflakeText'),
    notes: t('armorSpecialSnowflakeNotes', { con: 15 }),
    con: 15,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday: {
    event: EVENTS.birthday,
    text: t('armorSpecialBirthdayText'),
    notes: t('armorSpecialBirthdayNotes'),
    value: 0,
  },
  springRogue: {
    set: 'stealthyKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springWarrior: {
    set: 'mightyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springMage: {
    set: 'magicMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springHealer: {
    set: 'lovingPupSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summerRogue: {
    set: 'roguishPirateSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerWarrior: {
    set: 'daringSwashbucklerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerMage: {
    set: 'emeraldMermageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerHealer: {
    set: 'reefSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fallRogue: {
    set: 'vampireSmiterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallWarrior: {
    set: 'monsterOfScienceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallMage: {
    set: 'witchyWizardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallHealer: {
    set: 'mummyMedicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2015Rogue: {
    set: 'icicleDrakeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Warrior: {
    set: 'gingerbreadSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Mage: {
    set: 'northMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Healer: {
    set: 'soothingSkaterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2015: {
    text: t('armorSpecialBirthday2015Text'),
    notes: t('armorSpecialBirthday2015Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2015'),
  },
  spring2015Rogue: {
    set: 'sneakySqueakerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Warrior: {
    set: 'bewareDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Mage: {
    set: 'magicianBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Healer: {
    set: 'comfortingKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2015Rogue: {
    set: 'reefRenegadeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Warrior: {
    set: 'sunfishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Mage: {
    set: 'shipSoothsayerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Healer: {
    set: 'strappingSailorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2015Rogue: {
    set: 'battleRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Warrior: {
    set: 'scarecrowWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Mage: {
    set: 'stitchWitchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Healer: {
    set: 'potionerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  gaymerx: {
    event: EVENTS.gaymerx,
    text: t('armorSpecialGaymerxText'),
    notes: t('armorSpecialGaymerxNotes'),
    value: 0,
  },
  winter2016Rogue: {
    set: 'cocoaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Warrior: {
    set: 'snowDaySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Mage: {
    set: 'snowboardingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Healer: {
    set: 'festiveFairySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2016: {
    text: t('armorSpecialBirthday2016Text'),
    notes: t('armorSpecialBirthday2016Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2016'),
  },
  spring2016Rogue: {
    set: 'cleverDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Warrior: {
    set: 'braveMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Mage: {
    set: 'grandMalkinSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Healer: {
    set: 'springingBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2016Rogue: {
    set: 'summer2016EelSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Warrior: {
    set: 'summer2016SharkWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Mage: {
    set: 'summer2016DolphinMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Healer: {
    set: 'summer2016SeahorseHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2016Rogue: {
    set: 'fall2016BlackWidowSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Warrior: {
    set: 'fall2016SwampThingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Mage: {
    set: 'fall2016WickedSorcererSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Healer: {
    set: 'fall2016GorgonHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2017Rogue: {
    set: 'winter2017FrostyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Warrior: {
    set: 'winter2017IceHockeySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Mage: {
    set: 'winter2017WinterWolfSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Healer: {
    set: 'winter2017SugarPlumSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2017: {
    text: t('armorSpecialBirthday2017Text'),
    notes: t('armorSpecialBirthday2017Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2017'),
  },
  spring2017Rogue: {
    set: 'spring2017SneakyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Warrior: {
    set: 'spring2017FelineWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Mage: {
    set: 'spring2017CanineConjurorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Healer: {
    set: 'spring2017FloralMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2017Rogue: {
    set: 'summer2017SeaDragonSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Warrior: {
    set: 'summer2017SandcastleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Mage: {
    set: 'summer2017WhirlpoolMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Healer: {
    set: 'summer2017SeashellSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2017Rogue: {
    set: 'fall2017TrickOrTreatSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Warrior: {
    set: 'fall2017HabitoweenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Mage: {
    set: 'fall2017MasqueradeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Healer: {
    set: 'fall2017HauntedHouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2018Rogue: {
    set: 'winter2018ReindeerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Warrior: {
    set: 'winter2018GiftWrappedSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Mage: {
    set: 'winter2018ConfettiSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Healer: {
    set: 'winter2018MistletoeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2018: {
    text: t('armorSpecialBirthday2018Text'),
    notes: t('armorSpecialBirthday2018Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2018'),
  },
  spring2018Rogue: {
    set: 'spring2018DucklingRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Warrior: {
    set: 'spring2018SunriseWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Mage: {
    set: 'spring2018TulipMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Healer: {
    set: 'spring2018GarnetHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2018Rogue: {
    set: 'summer2018FisherRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Warrior: {
    set: 'summer2018BettaFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Mage: {
    set: 'summer2018LionfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Healer: {
    set: 'summer2018MerfolkMonarchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2018Rogue: {
    set: 'fall2018AlterEgoSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Warrior: {
    set: 'fall2018MinotaurWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Mage: {
    set: 'fall2018CandymancerMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Healer: {
    set: 'fall2018CarnivorousPlantSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  turkeyArmorGilded: {
    text: t('armorSpecialTurkeyArmorGildedText'),
    notes: t('armorSpecialTurkeyArmorGildedNotes'),
    value: 0,
    canOwn: ownsItem('armor_special_turkeyArmorGilded'),
  },
  winter2019Rogue: {
    set: 'winter2019PoinsettiaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Warrior: {
    set: 'winter2019BlizzardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Mage: {
    set: 'winter2019PyrotechnicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Healer: {
    set: 'winter2019WinterStarSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2019: {
    text: t('armorSpecialBirthday2019Text'),
    notes: t('armorSpecialBirthday2019Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2019'),
  },
  spring2019Rogue: {
    set: 'spring2019CloudRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Warrior: {
    set: 'spring2019OrchidWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Mage: {
    set: 'spring2019AmberMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Healer: {
    set: 'spring2019RobinHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2019Rogue: {
    set: 'summer2019HammerheadRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Warrior: {
    set: 'summer2019SeaTurtleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Mage: {
    set: 'summer2019WaterLilyMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Healer: {
    set: 'summer2019ConchHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2019Rogue: {
    set: 'fall2019OperaticSpecterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Warrior: {
    set: 'fall2019RavenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Mage: {
    set: 'fall2019CyclopsSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Healer: {
    set: 'fall2019LichSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  ks2019: {
    text: t('armorSpecialKS2019Text'),
    notes: t('armorSpecialKS2019Notes', { con: 20 }),
    value: 0,
    con: 20,
    canOwn: ownsItem('armor_special_ks2019'),
  },
  winter2020Rogue: {
    set: 'winter2020LanternSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Warrior: {
    set: 'winter2020EvergreenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Mage: {
    set: 'winter2020CarolOfTheMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Healer: {
    set: 'winter2020WinterSpiceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2020: {
    text: t('armorSpecialBirthday2020Text'),
    notes: t('armorSpecialBirthday2020Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2020'),
  },
  spring2020Rogue: {
    set: 'spring2020LapisLazuliRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Warrior: {
    set: 'spring2020BeetleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Mage: {
    set: 'spring2020PuddleMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Healer: {
    set: 'spring2020IrisHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2020Rogue: {
    set: 'summer2020CrocodileRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Warrior: {
    set: 'summer2020RainbowTroutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Mage: {
    set: 'summer2020OarfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Healer: {
    set: 'summer2020SeaGlassHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2020Rogue: {
    set: 'fall2020TwoHeadedRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Warrior: {
    set: 'fall2020WraithWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Mage: {
    set: 'fall2020ThirdEyeMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Healer: {
    set: 'fall2020DeathsHeadMothHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2021Rogue: {
    set: 'winter2021HollyIvyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Warrior: {
    set: 'winter2021IceFishingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Mage: {
    set: 'winter2021WinterMoonMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Healer: {
    set: 'winter2021ArcticExplorerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2021: {
    text: t('armorSpecialBirthday2021Text'),
    notes: t('armorSpecialBirthday2021Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2021'),
  },
  spring2021Rogue: {
    set: 'spring2021TwinFlowerRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Warrior: {
    set: 'spring2021SunstoneWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Mage: {
    set: 'spring2021SwanMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Healer: {
    set: 'spring2021WillowHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2021Rogue: {
    set: 'summer2021ClownfishRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Warrior: {
    set: 'summer2021FlyingFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Mage: {
    set: 'summer2021NautilusMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Healer: {
    set: 'summer2021ParrotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2021Rogue: {
    set: 'fall2021OozeRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Warrior: {
    set: 'fall2021HeadlessWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Mage: {
    set: 'fall2021BrainEaterMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Healer: {
    set: 'fall2021FlameSummonerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2022Rogue: {
    set: 'winter2022FireworksRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Warrior: {
    set: 'winter2022StockingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Mage: {
    set: 'winter2022PomegranateMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Healer: {
    set: 'winter2022IceCrystalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2022Rogue: {
    set: 'spring2022MagpieRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Warrior: {
    set: 'spring2022RainstormWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Mage: {
    set: 'spring2022ForsythiaMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Healer: {
    set: 'spring2022PeridotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  birthday2022: {
    text: t('armorSpecialBirthday2022Text'),
    notes: t('armorSpecialBirthday2022Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2022'),
  },
  summer2022Rogue: {
    set: 'summer2022CrabRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Warrior: {
    set: 'summer2022WaterspoutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Mage: {
    set: 'summer2022MantaRayMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Healer: {
    set: 'summer2022AngelfishHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2022Rogue: {
    set: 'fall2022KappaRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Warrior: {
    set: 'fall2022OrcWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Mage: {
    set: 'fall2022HarpyMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Healer: {
    set: 'fall2022WatcherHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2023Rogue: {
    set: 'winter2023RibbonRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Warrior: {
    set: 'winter2023WalrusWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Mage: {
    set: 'winter2023FairyLightsMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Healer: {
    set: 'winter2023CardinalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  birthday2023: {
    text: t('armorSpecialBirthday2023Text'),
    notes: t('armorSpecialBirthday2023Notes'),
    value: 0,
    canOwn: ownsItem('armor_special_birthday2023'),
  },
  spring2023Rogue: {
    set: 'spring2023CaterpillarRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Warrior: {
    set: 'spring2023HummingbirdWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Mage: {
    set: 'spring2023MoonstoneMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Healer: {
    set: 'spring2023LilyHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2023Rogue: {
    set: 'summer2023GuppyRogueSet',
  },
  summer2023Warrior: {
    set: 'summer2023GoldfishWarriorSet',
  },
  summer2023Mage: {
    set: 'summer2023CoralMageSet',
  },
  summer2023Healer: {
    set: 'summer2023KelpHealerSet',
  },
};

const armorStats = {
  healer: { con: 15 },
  rogue: { per: 15 },
  warrior: { con: 9 },
  wizard: { int: 9 },
};

Object.keys(gearEvents).forEach(event => {
  CLASSES.forEach(klass => {
    const classNameString = getClassName(klass);
    const eventString = `${event}${upperFirst(classNameString)}`;
    const textString = `armorSpecial${upperFirst(event)}${upperFirst(classNameString)}`;
    defaults(armor[eventString], {
      event: gearEvents[event],
      specialClass: klass,
      text: t(`${textString}Text`),
      notes: t(`${textString}Notes`, armorStats[klass]),
      value: 90,
    }, armorStats[klass]);
    if (armor[eventString].canBuy && armor[eventString].canBuy()) {
      armor[eventString].event = CURRENT_EVENT;
    }
  });
});

const back = {
  wondercon_red: wonderconGear.backSpecialWonderconRed, // eslint-disable-line camelcase
  wondercon_black: wonderconGear.backSpecialWonderconBlack, // eslint-disable-line camelcase
  takeThis: takeThisGear.backSpecialTakeThis,
  heroicAureole: contributorGear.backSpecialHeroicAureole,
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
  bearTail: {
    gearSet: 'animal',
    text: t('backBearTailText'),
    notes: t('backBearTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_bearTail'),
    canBuy: () => true,
  },
  cactusTail: {
    gearSet: 'animal',
    text: t('backCactusTailText'),
    notes: t('backCactusTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_cactusTail'),
    canBuy: () => true,
  },
  foxTail: {
    gearSet: 'animal',
    text: t('backFoxTailText'),
    notes: t('backFoxTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_foxTail'),
    canBuy: () => true,
  },
  lionTail: {
    gearSet: 'animal',
    text: t('backLionTailText'),
    notes: t('backLionTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_lionTail'),
    canBuy: () => true,
  },
  pandaTail: {
    gearSet: 'animal',
    text: t('backPandaTailText'),
    notes: t('backPandaTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_pandaTail'),
    canBuy: () => true,
  },
  pigTail: {
    gearSet: 'animal',
    text: t('backPigTailText'),
    notes: t('backPigTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_pigTail'),
    canBuy: () => true,
  },
  tigerTail: {
    gearSet: 'animal',
    text: t('backTigerTailText'),
    notes: t('backTigerTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_tigerTail'),
    canBuy: () => true,
  },
  wolfTail: {
    gearSet: 'animal',
    text: t('backWolfTailText'),
    notes: t('backWolfTailNotes'),
    value: 20,
    canOwn: ownsItem('back_special_wolfTail'),
    canBuy: () => true,
  },
  turkeyTailGilded: {
    text: t('backSpecialTurkeyTailGildedText'),
    notes: t('backSpecialTurkeyTailGildedNotes'),
    value: 0,
    canOwn: ownsItem('back_special_turkeyTailGilded'),
  },
  namingDay2020: {
    text: t('backSpecialNamingDay2020Text'),
    notes: t('backSpecialNamingDay2020Notes'),
    value: 0,
    canOwn: ownsItem('back_special_namingDay2020'),
  },
  anniversary: {
    text: t('backSpecialAnniversaryText'),
    notes: t('backSpecialAnniversaryNotes'),
    value: 0,
    canOwn: ownsItem('back_special_anniversary'),
  },
};

const body = {
  wondercon_red: wonderconGear.bodySpecialWonderconRed, // eslint-disable-line camelcase
  wondercon_gold: wonderconGear.bodySpecialWonderconGold, // eslint-disable-line camelcase
  wondercon_black: wonderconGear.bodySpecialWonderconBlack, // eslint-disable-line camelcase
  takeThis: takeThisGear.bodySpecialTakeThis,
  summerHealer: {
    specialClass: 'healer',
    set: 'reefSeahealerSet',
    text: t('bodySpecialSummerHealerText'),
    notes: t('bodySpecialSummerHealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerMage: {
    specialClass: 'wizard',
    set: 'emeraldMermageSet',
    text: t('bodySpecialSummerMageText'),
    notes: t('bodySpecialSummerMageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Healer: {
    specialClass: 'healer',
    set: 'strappingSailorSet',
    text: t('bodySpecialSummer2015HealerText'),
    notes: t('bodySpecialSummer2015HealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Mage: {
    specialClass: 'wizard',
    set: 'shipSoothsayerSet',
    text: t('bodySpecialSummer2015MageText'),
    notes: t('bodySpecialSummer2015MageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Rogue: {
    specialClass: 'rogue',
    set: 'reefRenegadeSet',
    text: t('bodySpecialSummer2015RogueText'),
    notes: t('bodySpecialSummer2015RogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Warrior: {
    specialClass: 'warrior',
    set: 'sunfishWarriorSet',
    text: t('bodySpecialSummer2015WarriorText'),
    notes: t('bodySpecialSummer2015WarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  aetherAmulet: {
    text: t('bodySpecialAetherAmuletText'),
    notes: t('bodySpecialAetherAmuletNotes', { attrs: 10 }),
    value: 175,
    str: 10,
    con: 10,
    canOwn: ownsItem('body_special_aetherAmulet'),
  },
  namingDay2018: {
    text: t('bodySpecialNamingDay2018Text'),
    notes: t('bodySpecialNamingDay2018Notes'),
    value: 0,
    canOwn: ownsItem('body_special_namingDay2018'),
  },
  anniversary: {
    text: t('bodySpecialAnniversaryText'),
    notes: t('bodySpecialAnniversaryNotes'),
    value: 0,
    canOwn: ownsItem('body_special_anniversary'),
  },
};

const eyewear = {
  wondercon_red: wonderconGear.eyewearSpecialWonderconRed, // eslint-disable-line camelcase
  wondercon_black: wonderconGear.eyewearSpecialWonderconBlack, // eslint-disable-line camelcase
  summerRogue: {
    specialClass: 'rogue',
    set: 'roguishPirateSet',
    text: t('eyewearSpecialSummerRogueText'),
    notes: t('eyewearSpecialSummerRogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerWarrior: {
    specialClass: 'warrior',
    set: 'daringSwashbucklerSet',
    text: t('eyewearSpecialSummerWarriorText'),
    notes: t('eyewearSpecialSummerWarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
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
  blackHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialBlackHalfMoonText'),
    notes: t('eyewearSpecialBlackHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_blackHalfMoon'),
  },
  blueHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialBlueHalfMoonText'),
    notes: t('eyewearSpecialBlueHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_blueHalfMoon'),
  },
  greenHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialGreenHalfMoonText'),
    notes: t('eyewearSpecialGreenHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_greenHalfMoon'),
  },
  pinkHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialPinkHalfMoonText'),
    notes: t('eyewearSpecialPinkHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_pinkHalfMoon'),
  },
  redHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialRedHalfMoonText'),
    notes: t('eyewearSpecialRedHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_redHalfMoon'),
  },
  whiteHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialWhiteHalfMoonText'),
    notes: t('eyewearSpecialWhiteHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_whiteHalfMoon'),
  },
  yellowHalfMoon: {
    gearSet: 'glasses',
    text: t('eyewearSpecialYellowHalfMoonText'),
    notes: t('eyewearSpecialYellowHalfMoonNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_yellowHalfMoon'),
  },
  fall2019Rogue: {
    specialClass: 'rogue',
    set: 'fall2019OperaticSpecterSet',
    text: t('eyewearSpecialFall2019RogueText'),
    notes: t('eyewearSpecialFall2019RogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Healer: {
    specialClass: 'healer',
    set: 'fall2019LichSet',
    text: t('eyewearSpecialFall2019HealerText'),
    notes: t('eyewearSpecialFall2019HealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  ks2019: {
    text: t('eyewearSpecialKS2019Text'),
    notes: t('eyewearSpecialKS2019Notes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_ks2019'),
  },
  anniversary: {
    text: t('eyewearSpecialAnniversaryText'),
    notes: t('eyewearSpecialAnniversaryNotes'),
    value: 0,
    canOwn: ownsItem('eyewear_special_anniversary'),
  },
};

const head = {
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
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('headSpecialYetiText'),
    notes: t('headSpecialYetiNotes', { str: 9 }),
    str: 9,
    value: 60,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  ski: {
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('headSpecialSkiText'),
    notes: t('headSpecialSkiNotes', { per: 9 }),
    per: 9,
    value: 60,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  candycane: {
    specialClass: 'wizard',
    set: 'candycaneSet',
    text: t('headSpecialCandycaneText'),
    notes: t('headSpecialCandycaneNotes', { per: 7 }),
    per: 7,
    value: 60,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  snowflake: {
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('headSpecialSnowflakeText'),
    notes: t('headSpecialSnowflakeNotes', { int: 7 }),
    int: 7,
    value: 60,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  springRogue: {
    set: 'stealthyKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springWarrior: {
    set: 'mightyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springMage: {
    set: 'magicMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springHealer: {
    set: 'lovingPupSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summerRogue: {
    set: 'roguishPirateSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerWarrior: {
    set: 'daringSwashbucklerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerMage: {
    set: 'emeraldMermageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerHealer: {
    set: 'reefSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fallRogue: {
    set: 'vampireSmiterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallWarrior: {
    set: 'monsterOfScienceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallMage: {
    set: 'witchyWizardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallHealer: {
    set: 'mummyMedicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2015Rogue: {
    set: 'icicleDrakeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Warrior: {
    set: 'gingerbreadSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Mage: {
    set: 'northMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Healer: {
    set: 'soothingSkaterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2014: {
    text: t('headSpecialNye2014Text'),
    notes: t('headSpecialNye2014Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2014'),
  },
  spring2015Rogue: {
    set: 'sneakySqueakerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Warrior: {
    set: 'bewareDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Mage: {
    set: 'magicianBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Healer: {
    set: 'comfortingKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2015Rogue: {
    set: 'reefRenegadeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Warrior: {
    set: 'sunfishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Mage: {
    set: 'shipSoothsayerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Healer: {
    set: 'strappingSailorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2015Rogue: {
    set: 'battleRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Warrior: {
    set: 'scarecrowWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Mage: {
    set: 'stitchWitchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Healer: {
    set: 'potionerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  gaymerx: {
    event: EVENTS.gaymerx,
    text: t('headSpecialGaymerxText'),
    notes: t('headSpecialGaymerxNotes'),
    value: 0,
  },
  winter2016Rogue: {
    set: 'cocoaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Warrior: {
    set: 'snowDaySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Mage: {
    set: 'snowboardingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Healer: {
    set: 'festiveFairySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2015: {
    text: t('headSpecialNye2015Text'),
    notes: t('headSpecialNye2015Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2015'),
  },
  spring2016Rogue: {
    set: 'cleverDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Warrior: {
    set: 'braveMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Mage: {
    set: 'grandMalkinSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Healer: {
    set: 'springingBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2016Rogue: {
    set: 'summer2016EelSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Warrior: {
    set: 'summer2016SharkWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Mage: {
    set: 'summer2016DolphinMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Healer: {
    set: 'summer2016SeahorseHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2016Rogue: {
    set: 'fall2016BlackWidowSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Warrior: {
    set: 'fall2016SwampThingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Mage: {
    set: 'fall2016WickedSorcererSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Healer: {
    set: 'fall2016GorgonHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2017Rogue: {
    set: 'winter2017FrostyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Warrior: {
    set: 'winter2017IceHockeySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Mage: {
    set: 'winter2017WinterWolfSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Healer: {
    set: 'winter2017SugarPlumSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2016: {
    text: t('headSpecialNye2016Text'),
    notes: t('headSpecialNye2016Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2016'),
  },
  spring2017Rogue: {
    set: 'spring2017SneakyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Warrior: {
    set: 'spring2017FelineWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Mage: {
    set: 'spring2017CanineConjurorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Healer: {
    set: 'spring2017FloralMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2017Rogue: {
    set: 'summer2017SeaDragonSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Warrior: {
    set: 'summer2017SandcastleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Mage: {
    set: 'summer2017WhirlpoolMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Healer: {
    set: 'summer2017SeashellSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  namingDay2017: {
    text: t('headSpecialNamingDay2017Text'),
    notes: t('headSpecialNamingDay2017Notes'),
    value: 0,
    canOwn: ownsItem('head_special_namingDay2017'),
  },
  fall2017Rogue: {
    set: 'fall2017TrickOrTreatSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Warrior: {
    set: 'fall2017HabitoweenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Mage: {
    set: 'fall2017MasqueradeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Healer: {
    set: 'fall2017HauntedHouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  nye2017: {
    text: t('headSpecialNye2017Text'),
    notes: t('headSpecialNye2017Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2017'),
  },
  winter2018Rogue: {
    set: 'winter2018ReindeerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Warrior: {
    set: 'winter2018GiftWrappedSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Mage: {
    set: 'winter2018ConfettiSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Healer: {
    set: 'winter2018MistletoeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2018Rogue: {
    set: 'spring2018DucklingRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Warrior: {
    set: 'spring2018SunriseWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Mage: {
    set: 'spring2018TulipMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Healer: {
    set: 'spring2018GarnetHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2018Rogue: {
    set: 'summer2018FisherRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Warrior: {
    set: 'summer2018BettaFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Mage: {
    set: 'summer2018LionfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Healer: {
    set: 'summer2018MerfolkMonarchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2018Rogue: {
    set: 'fall2018AlterEgoSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Warrior: {
    set: 'fall2018MinotaurWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Mage: {
    set: 'fall2018CandymancerMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Healer: {
    set: 'fall2018CarnivorousPlantSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  turkeyHelmGilded: {
    text: t('headSpecialTurkeyHelmGildedText'),
    notes: t('headSpecialTurkeyHelmGildedNotes'),
    value: 0,
    canOwn: ownsItem('head_special_turkeyHelmGilded'),
  },
  winter2019Rogue: {
    set: 'winter2019PoinsettiaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Warrior: {
    set: 'winter2019BlizzardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Mage: {
    set: 'winter2019PyrotechnicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Healer: {
    set: 'winter2019WinterStarSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2018: {
    text: t('headSpecialNye2018Text'),
    notes: t('headSpecialNye2018Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2018'),
  },
  piDay: {
    text: t('headSpecialPiDayText'),
    notes: t('headSpecialPiDayNotes'),
    value: 0,
    canOwn: ownsItem('head_special_piDay'),
  },
  spring2019Rogue: {
    set: 'spring2019CloudRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Warrior: {
    set: 'spring2019OrchidWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Mage: {
    set: 'spring2019AmberMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Healer: {
    set: 'spring2019RobinHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2019Rogue: {
    set: 'summer2019HammerheadRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Warrior: {
    set: 'summer2019SeaTurtleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Mage: {
    set: 'summer2019WaterLilyMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Healer: {
    set: 'summer2019ConchHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2019Rogue: {
    set: 'fall2019OperaticSpecterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Warrior: {
    set: 'fall2019RavenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Mage: {
    set: 'fall2019CyclopsSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Healer: {
    set: 'fall2019LichSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  ks2019: {
    text: t('headSpecialKS2019Text'),
    notes: t('headSpecialKS2019Notes', { int: 20 }),
    value: 0,
    int: 20,
    canOwn: ownsItem('head_special_ks2019'),
  },
  winter2020Rogue: {
    set: 'winter2020LanternSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Warrior: {
    set: 'winter2020EvergreenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Mage: {
    set: 'winter2020CarolOfTheMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Healer: {
    set: 'winter2020WinterSpiceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2019: {
    text: t('headSpecialNye2019Text'),
    notes: t('headSpecialNye2019Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2019'),
  },
  spring2020Rogue: {
    set: 'spring2020LapisLazuliRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Warrior: {
    set: 'spring2020BeetleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Mage: {
    set: 'spring2020PuddleMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Healer: {
    set: 'spring2020IrisHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2020Rogue: {
    set: 'summer2020CrocodileRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Warrior: {
    set: 'summer2020RainbowTroutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Mage: {
    set: 'summer2020OarfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Healer: {
    set: 'summer2020SeaGlassHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2020Rogue: {
    set: 'fall2020TwoHeadedRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Warrior: {
    set: 'fall2020WraithWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Mage: {
    set: 'fall2020ThirdEyeMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Healer: {
    set: 'fall2020DeathsHeadMothHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2021Rogue: {
    set: 'winter2021HollyIvyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Warrior: {
    set: 'winter2021IceFishingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Mage: {
    set: 'winter2021WinterMoonMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Healer: {
    set: 'winter2021ArcticExplorerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2020: {
    text: t('headSpecialNye2020Text'),
    notes: t('headSpecialNye2020Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2020'),
  },
  spring2021Rogue: {
    set: 'spring2021TwinFlowerRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Warrior: {
    set: 'spring2021SunstoneWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Mage: {
    set: 'spring2021SwanMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Healer: {
    set: 'spring2021WillowHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2021Rogue: {
    set: 'summer2021ClownfishRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Warrior: {
    set: 'summer2021FlyingFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Mage: {
    set: 'summer2021NautilusMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Healer: {
    set: 'summer2021ParrotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2021Rogue: {
    set: 'fall2021OozeRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Warrior: {
    set: 'fall2021HeadlessWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Mage: {
    set: 'fall2021BrainEaterMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Healer: {
    set: 'fall2021FlameSummonerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2022Rogue: {
    set: 'winter2022FireworksRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Warrior: {
    set: 'winter2022StockingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Mage: {
    set: 'winter2022PomegranateMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Healer: {
    set: 'winter2022IceCrystalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2021: {
    text: t('headSpecialNye2021Text'),
    notes: t('headSpecialNye2021Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2021'),
  },
  spring2022Rogue: {
    set: 'spring2022MagpieRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Warrior: {
    set: 'spring2022RainstormWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Mage: {
    set: 'spring2022ForsythiaMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Healer: {
    set: 'spring2022PeridotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2022Rogue: {
    set: 'summer2022CrabRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Warrior: {
    set: 'summer2022WaterspoutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Mage: {
    set: 'summer2022MantaRayMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Healer: {
    set: 'summer2022AngelfishHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2022Rogue: {
    set: 'fall2022KappaRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Warrior: {
    set: 'fall2022OrcWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Mage: {
    set: 'fall2022HarpyMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Healer: {
    set: 'fall2022WatcherHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2023Rogue: {
    set: 'winter2023RibbonRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Warrior: {
    set: 'winter2023WalrusWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Mage: {
    set: 'winter2023FairyLightsMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Healer: {
    set: 'winter2023CardinalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  nye2022: {
    text: t('headSpecialNye2022Text'),
    notes: t('headSpecialNye2022Notes'),
    value: 0,
    canOwn: ownsItem('head_special_nye2022'),
  },
  spring2023Rogue: {
    set: 'spring2023CaterpillarRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Warrior: {
    set: 'spring2023HummingbirdWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Mage: {
    set: 'spring2023MoonstoneMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Healer: {
    set: 'spring2023LilyHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2023Rogue: {
    set: 'summer2023GuppyRogueSet',
  },
  summer2023Warrior: {
    set: 'summer2023GoldfishWarriorSet',
  },
  summer2023Mage: {
    set: 'summer2023CoralMageSet',
  },
  summer2023Healer: {
    set: 'summer2023KelpHealerSet',
  },
};

const headStats = {
  healer: { int: 7 },
  rogue: { per: 9 },
  warrior: { str: 9 },
  wizard: { per: 7 },
};

Object.keys(gearEvents).forEach(event => {
  CLASSES.forEach(klass => {
    const classNameString = getClassName(klass);
    const eventString = `${event}${upperFirst(classNameString)}`;
    const textString = `headSpecial${upperFirst(event)}${upperFirst(classNameString)}`;
    defaults(head[eventString], {
      event: gearEvents[event],
      specialClass: klass,
      text: t(`${textString}Text`),
      notes: t(`${textString}Notes`, headStats[klass]),
      value: 60,
    }, headStats[klass]);
    if (head[eventString].canBuy && head[eventString].canBuy()) {
      head[eventString].event = CURRENT_EVENT;
    }
  });
});

const headAccessory = {
  heroicCirclet: contributorGear.headAccessorySpecialHeroicCirclet,
  springRogue: {
    specialClass: 'rogue',
    set: 'stealthyKittySet',
    text: t('headAccessorySpecialSpringRogueText'),
    notes: t('headAccessorySpecialSpringRogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springWarrior: {
    specialClass: 'warrior',
    set: 'mightyBunnySet',
    text: t('headAccessorySpecialSpringWarriorText'),
    notes: t('headAccessorySpecialSpringWarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springMage: {
    specialClass: 'wizard',
    set: 'magicMouseSet',
    text: t('headAccessorySpecialSpringMageText'),
    notes: t('headAccessorySpecialSpringMageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springHealer: {
    specialClass: 'healer',
    set: 'lovingPupSet',
    text: t('headAccessorySpecialSpringHealerText'),
    notes: t('headAccessorySpecialSpringHealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Rogue: {
    specialClass: 'rogue',
    set: 'sneakySqueakerSet',
    text: t('headAccessorySpecialSpring2015RogueText'),
    notes: t('headAccessorySpecialSpring2015RogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Warrior: {
    specialClass: 'warrior',
    set: 'bewareDogSet',
    text: t('headAccessorySpecialSpring2015WarriorText'),
    notes: t('headAccessorySpecialSpring2015WarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Mage: {
    specialClass: 'wizard',
    set: 'magicianBunnySet',
    text: t('headAccessorySpecialSpring2015MageText'),
    notes: t('headAccessorySpecialSpring2015MageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Healer: {
    specialClass: 'healer',
    set: 'comfortingKittySet',
    text: t('headAccessorySpecialSpring2015HealerText'),
    notes: t('headAccessorySpecialSpring2015HealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  bearEars: {
    gearSet: 'animal',
    text: t('headAccessoryBearEarsText'),
    notes: t('headAccessoryBearEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_bearEars'),
    canBuy: () => true,
  },
  cactusEars: {
    gearSet: 'animal',
    text: t('headAccessoryCactusEarsText'),
    notes: t('headAccessoryCactusEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_cactusEars'),
    canBuy: () => true,
  },
  foxEars: {
    gearSet: 'animal',
    text: t('headAccessoryFoxEarsText'),
    notes: t('headAccessoryFoxEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_foxEars'),
    canBuy: () => true,
  },
  lionEars: {
    gearSet: 'animal',
    text: t('headAccessoryLionEarsText'),
    notes: t('headAccessoryLionEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_lionEars'),
    canBuy: () => true,
  },
  pandaEars: {
    gearSet: 'animal',
    text: t('headAccessoryPandaEarsText'),
    notes: t('headAccessoryPandaEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_pandaEars'),
    canBuy: () => true,
  },
  pigEars: {
    gearSet: 'animal',
    text: t('headAccessoryPigEarsText'),
    notes: t('headAccessoryPigEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_pigEars'),
    canBuy: () => true,
  },
  tigerEars: {
    gearSet: 'animal',
    text: t('headAccessoryTigerEarsText'),
    notes: t('headAccessoryTigerEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_tigerEars'),
    canBuy: () => true,
  },
  wolfEars: {
    gearSet: 'animal',
    text: t('headAccessoryWolfEarsText'),
    notes: t('headAccessoryWolfEarsNotes'),
    value: 20,
    canOwn: ownsItem('headAccessory_special_wolfEars'),
    canBuy: () => true,
  },
  spring2016Rogue: {
    specialClass: 'rogue',
    set: 'cleverDogSet',
    text: t('headAccessorySpecialSpring2016RogueText'),
    notes: t('headAccessorySpecialSpring2016RogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Warrior: {
    specialClass: 'warrior',
    set: 'braveMouseSet',
    text: t('headAccessorySpecialSpring2016WarriorText'),
    notes: t('headAccessorySpecialSpring2016WarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Mage: {
    specialClass: 'wizard',
    set: 'grandMalkinSet',
    text: t('headAccessorySpecialSpring2016MageText'),
    notes: t('headAccessorySpecialSpring2016MageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Healer: {
    specialClass: 'healer',
    set: 'springingBunnySet',
    text: t('headAccessorySpecialSpring2016HealerText'),
    notes: t('headAccessorySpecialSpring2016HealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Rogue: {
    specialClass: 'rogue',
    set: 'spring2017SneakyBunnySet',
    text: t('headAccessorySpecialSpring2017RogueText'),
    notes: t('headAccessorySpecialSpring2017RogueNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Warrior: {
    specialClass: 'warrior',
    set: 'spring2017FelineWarriorSet',
    text: t('headAccessorySpecialSpring2017WarriorText'),
    notes: t('headAccessorySpecialSpring2017WarriorNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Mage: {
    specialClass: 'wizard',
    set: 'spring2017CanineConjurorSet',
    text: t('headAccessorySpecialSpring2017MageText'),
    notes: t('headAccessorySpecialSpring2017MageNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Healer: {
    specialClass: 'healer',
    set: 'spring2017FloralMouseSet',
    text: t('headAccessorySpecialSpring2017HealerText'),
    notes: t('headAccessorySpecialSpring2017HealerNotes'),
    value: 20,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  blackHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryBlackHeadbandText'),
    notes: t('headAccessoryBlackHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_blackHeadband'),
  },
  blueHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryBlueHeadbandText'),
    notes: t('headAccessoryBlueHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_blueHeadband'),
  },
  greenHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryGreenHeadbandText'),
    notes: t('headAccessoryGreenHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_greenHeadband'),
  },
  pinkHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryPinkHeadbandText'),
    notes: t('headAccessoryPinkHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_pinkHeadband'),
  },
  redHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryRedHeadbandText'),
    notes: t('headAccessoryRedHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_redHeadband'),
  },
  whiteHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryWhiteHeadbandText'),
    notes: t('headAccessoryWhiteHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_whiteHeadband'),
  },
  yellowHeadband: {
    gearSet: 'headband',
    text: t('headAccessoryYellowHeadbandText'),
    notes: t('headAccessoryYellowHeadbandNotes'),
    value: 0,
    canOwn: ownsItem('headAccessory_special_yellowHeadband'),
  },
};

const shield = {
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
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('shieldSpecialYetiText'),
    notes: t('shieldSpecialYetiNotes', { con: 7 }),
    con: 7,
    value: 70,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  ski: {
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('weaponSpecialSkiText'),
    notes: t('weaponSpecialSkiNotes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  snowflake: {
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('shieldSpecialSnowflakeText'),
    notes: t('shieldSpecialSnowflakeNotes', { con: 9 }),
    con: 9,
    value: 70,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  springRogue: {
    set: 'stealthyKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springWarrior: {
    set: 'mightyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springHealer: {
    set: 'lovingPupSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summerRogue: {
    set: 'roguishPirateSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerWarrior: {
    set: 'daringSwashbucklerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerHealer: {
    set: 'reefSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fallRogue: {
    set: 'vampireSmiterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallWarrior: {
    set: 'monsterOfScienceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallHealer: {
    set: 'mummyMedicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2015Rogue: {
    set: 'icicleDrakeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Warrior: {
    set: 'gingerbreadSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Healer: {
    set: 'soothingSkaterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2015Rogue: {
    set: 'sneakySqueakerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Warrior: {
    set: 'bewareDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Healer: {
    set: 'comfortingKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2015Rogue: {
    set: 'reefRenegadeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Warrior: {
    set: 'sunfishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Healer: {
    set: 'strappingSailorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2015Rogue: {
    set: 'battleRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Warrior: {
    set: 'scarecrowWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Healer: {
    set: 'potionerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2016Rogue: {
    set: 'cocoaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Warrior: {
    set: 'snowDaySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Healer: {
    set: 'festiveFairySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2016Rogue: {
    set: 'cleverDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Warrior: {
    set: 'braveMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Healer: {
    set: 'springingBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2016Rogue: {
    set: 'summer2016EelSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Warrior: {
    set: 'summer2016SharkWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Healer: {
    set: 'summer2016SeahorseHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2016Rogue: {
    set: 'fall2016BlackWidowSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Warrior: {
    set: 'fall2016SwampThingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Healer: {
    set: 'fall2016GorgonHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2017Rogue: {
    set: 'winter2017FrostyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Warrior: {
    set: 'winter2017IceHockeySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Healer: {
    set: 'winter2017SugarPlumSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2017Rogue: {
    set: 'spring2017SneakyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Warrior: {
    set: 'spring2017FelineWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Healer: {
    set: 'spring2017FloralMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2017Rogue: {
    set: 'summer2017SeaDragonSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Warrior: {
    set: 'summer2017SandcastleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Healer: {
    set: 'summer2017SeashellSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2017Rogue: {
    set: 'fall2017TrickOrTreatSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Warrior: {
    set: 'fall2017HabitoweenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Healer: {
    set: 'fall2017HauntedHouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2018Rogue: {
    set: 'winter2018ReindeerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Warrior: {
    set: 'winter2018GiftWrappedSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Healer: {
    set: 'winter2018MistletoeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2018Rogue: {
    set: 'spring2018DucklingRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Warrior: {
    set: 'spring2018SunriseWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Healer: {
    set: 'spring2018GarnetHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2018Rogue: {
    set: 'summer2018FisherRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Warrior: {
    set: 'summer2018BettaFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Healer: {
    set: 'summer2018MerfolkMonarchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2018Rogue: {
    set: 'fall2018AlterEgoSet',
    text: t('shieldSpecialFall2018RogueText'),
    notes: t('shieldSpecialFall2018RogueNotes', { str: 8 }),
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Warrior: {
    set: 'fall2018MinotaurWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Healer: {
    set: 'fall2018CarnivorousPlantSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2019Rogue: {
    set: 'winter2019PoinsettiaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Warrior: {
    set: 'winter2019BlizzardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Healer: {
    set: 'winter2019WinterStarSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  piDay: {
    text: t('shieldSpecialPiDayText'),
    notes: t('shieldSpecialPiDayNotes'),
    value: 0,
    canOwn: ownsItem('shield_special_piDay'),
  },
  spring2019Rogue: {
    set: 'spring2019CloudRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Warrior: {
    set: 'spring2019OrchidWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Healer: {
    set: 'spring2019RobinHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2019Rogue: {
    set: 'summer2019HammerheadRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Warrior: {
    set: 'summer2019SeaTurtleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Healer: {
    set: 'summer2019ConchHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Mage: {
    specialClass: 'wizard',
    set: 'summer2019WaterLilyMageSet',
    text: t('shieldSpecialSummer2019MageText'),
    notes: t('shieldSpecialSummer2019MageNotes', { per: 7 }),
    value: 70,
    per: 7,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2019Rogue: {
    set: 'fall2019OperaticSpecterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Warrior: {
    set: 'fall2019RavenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Healer: {
    set: 'fall2019LichSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  ks2019: {
    text: t('shieldSpecialKS2019Text'),
    notes: t('shieldSpecialKS2019Notes', { per: 20 }),
    value: 0,
    per: 20,
    canOwn: ownsItem('shield_special_ks2019'),
  },
  winter2020Rogue: {
    set: 'winter2020LanternSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Warrior: {
    set: 'winter2020EvergreenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Healer: {
    set: 'winter2020WinterSpiceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2020Rogue: {
    set: 'spring2020LapisLazuliRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Warrior: {
    set: 'spring2020BeetleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Healer: {
    set: 'spring2020IrisHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2020Warrior: {
    set: 'summer2020RainbowTroutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Healer: {
    set: 'summer2020SeaGlassHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Rogue: {
    set: 'summer2020CrocodileRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2020Rogue: {
    set: 'fall2020TwoHeadedRogueSet',
    text: t('shieldSpecialFall2020RogueText'),
    notes: t('shieldSpecialFall2020RogueNotes', { str: 8 }),
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Warrior: {
    set: 'fall2020WraithWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Healer: {
    set: 'fall2020DeathsHeadMothHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2021Rogue: {
    set: 'winter2021HollyIvyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Warrior: {
    set: 'winter2021IceFishingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Healer: {
    set: 'winter2021ArcticExplorerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2021Rogue: {
    set: 'spring2021TwinFlowerRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Warrior: {
    set: 'spring2021SunstoneWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Healer: {
    set: 'spring2021WillowHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2021Rogue: {
    set: 'summer2021ClownfishRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Warrior: {
    set: 'summer2021FlyingFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Healer: {
    set: 'summer2021ParrotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2021Rogue: {
    set: 'fall2021OozeRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Warrior: {
    set: 'fall2021HeadlessWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Healer: {
    set: 'fall2021FlameSummonerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2022Rogue: {
    set: 'winter2022FireworksRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Warrior: {
    set: 'winter2022StockingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Healer: {
    set: 'winter2022IceCrystalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2022Rogue: {
    set: 'spring2022MagpieRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Warrior: {
    set: 'spring2022RainstormWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Healer: {
    set: 'spring2022PeridotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2022Rogue: {
    set: 'summer2022CrabRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Warrior: {
    set: 'summer2022WaterspoutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Healer: {
    set: 'summer2022AngelfishHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2022Rogue: {
    set: 'fall2022KappaRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Warrior: {
    set: 'fall2022OrcWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Healer: {
    set: 'fall2022WatcherHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2023Rogue: {
    set: 'winter2023RibbonRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Warrior: {
    set: 'winter2023WalrusWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Healer: {
    set: 'winter2023CardinalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2023Rogue: {
    set: 'spring2023CaterpillarRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Warrior: {
    set: 'spring2023HummingbirdWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Healer: {
    set: 'spring2023LilyHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2023Rogue: {
    set: 'summer2023GuppyRogueSet',
  },
  summer2023Warrior: {
    set: 'summer2023GoldfishWarriorSet',
  },
  summer2023Healer: {
    set: 'summer2023KelpHealerSet',
  },
};

const shieldStats = {
  healer: { con: 9 },
  rogue: { str: 8 },
  warrior: { con: 7 },
};

Object.keys(gearEvents).forEach(event => {
  CLASSES.forEach(klass => {
    if (klass === 'wizard') return;
    const eventString = `${event}${upperFirst(klass)}`;
    const textString = klass === 'rogue' ? `weaponSpecial${upperFirst(event)}Rogue`
      : `shieldSpecial${upperFirst(event)}${upperFirst(klass)}`;
    defaults(shield[eventString], {
      event: gearEvents[event],
      specialClass: klass,
      text: t(`${textString}Text`),
      notes: t(`${textString}Notes`, shieldStats[klass]),
      value: klass === 'rogue' ? 80 : 70,
    }, shieldStats[klass]);
    if (shield[eventString].canBuy && shield[eventString].canBuy()) {
      shield[eventString].event = CURRENT_EVENT;
    }
  });
});

const weapon = {
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
    specialClass: 'warrior',
    set: 'yetiSet',
    text: t('weaponSpecialYetiText'),
    notes: t('weaponSpecialYetiNotes', { str: 15 }),
    str: 15,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  ski: {
    specialClass: 'rogue',
    set: 'skiSet',
    text: t('weaponSpecialSkiText'),
    notes: t('weaponSpecialSkiNotes', { str: 8 }),
    str: 8,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  candycane: {
    specialClass: 'wizard',
    set: 'candycaneSet',
    twoHanded: true,
    text: t('weaponSpecialCandycaneText'),
    notes: t('weaponSpecialCandycaneNotes', { int: 15, per: 7 }),
    int: 15,
    per: 7,
    value: 160,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  snowflake: {
    specialClass: 'healer',
    set: 'snowflakeSet',
    text: t('weaponSpecialSnowflakeText'),
    notes: t('weaponSpecialSnowflakeNotes', { int: 9 }),
    int: 9,
    value: 90,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  springRogue: {
    set: 'stealthyKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springWarrior: {
    set: 'mightyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springMage: {
    set: 'magicMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  springHealer: {
    set: 'lovingPupSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summerRogue: {
    set: 'roguishPirateSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerWarrior: {
    set: 'daringSwashbucklerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerMage: {
    set: 'emeraldMermageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summerHealer: {
    set: 'reefSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fallRogue: {
    set: 'vampireSmiterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallWarrior: {
    set: 'monsterOfScienceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallMage: {
    set: 'witchyWizardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fallHealer: {
    set: 'mummyMedicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2015Rogue: {
    set: 'icicleDrakeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Warrior: {
    set: 'gingerbreadSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Mage: {
    set: 'northMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2015Healer: {
    set: 'soothingSkaterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2015Rogue: {
    set: 'sneakySqueakerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Warrior: {
    set: 'bewareDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Mage: {
    set: 'magicianBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2015Healer: {
    set: 'comfortingKittySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2015Rogue: {
    set: 'reefRenegadeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Warrior: {
    set: 'sunfishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Mage: {
    set: 'shipSoothsayerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2015Healer: {
    set: 'strappingSailorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2015Rogue: {
    set: 'battleRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Warrior: {
    set: 'scarecrowWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Mage: {
    set: 'stitchWitchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2015Healer: {
    set: 'potionerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2016Rogue: {
    set: 'cocoaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Warrior: {
    set: 'snowDaySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Mage: {
    set: 'snowboardingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2016Healer: {
    set: 'festiveFairySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2016Rogue: {
    set: 'cleverDogSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Warrior: {
    set: 'braveMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Mage: {
    set: 'grandMalkinSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2016Healer: {
    set: 'springingBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2016Rogue: {
    set: 'summer2016EelSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Warrior: {
    set: 'summer2016SharkWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Mage: {
    set: 'summer2016DolphinMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2016Healer: {
    set: 'summer2016SeahorseHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2016Rogue: {
    set: 'fall2016BlackWidowSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Warrior: {
    set: 'fall2016SwampThingSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Mage: {
    set: 'fall2016WickedSorcererSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2016Healer: {
    set: 'fall2016GorgonHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2017Rogue: {
    set: 'winter2017FrostyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Warrior: {
    set: 'winter2017IceHockeySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Mage: {
    set: 'winter2017WinterWolfSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2017Healer: {
    set: 'winter2017SugarPlumSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2017Rogue: {
    set: 'spring2017SneakyBunnySet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Warrior: {
    set: 'spring2017FelineWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Mage: {
    set: 'spring2017CanineConjurorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2017Healer: {
    set: 'spring2017FloralMouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2017Rogue: {
    set: 'summer2017SeaDragonSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Warrior: {
    set: 'summer2017SandcastleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Mage: {
    set: 'summer2017WhirlpoolMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2017Healer: {
    set: 'summer2017SeashellSeahealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2017Rogue: {
    set: 'fall2017TrickOrTreatSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Warrior: {
    set: 'fall2017HabitoweenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Mage: {
    set: 'fall2017MasqueradeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2017Healer: {
    set: 'fall2017HauntedHouseSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2018Rogue: {
    set: 'winter2018ReindeerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Warrior: {
    set: 'winter2018GiftWrappedSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Mage: {
    set: 'winter2018ConfettiSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2018Healer: {
    set: 'winter2018MistletoeSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2018Rogue: {
    set: 'spring2018DucklingRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Warrior: {
    set: 'spring2018SunriseWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Mage: {
    set: 'spring2018TulipMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2018Healer: {
    set: 'spring2018GarnetHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2018Rogue: {
    set: 'summer2018FisherRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Warrior: {
    set: 'summer2018BettaFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Mage: {
    set: 'summer2018LionfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2018Healer: {
    set: 'summer2018MerfolkMonarchSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2018Rogue: {
    set: 'fall2018AlterEgoSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Warrior: {
    set: 'fall2018MinotaurWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Mage: {
    set: 'fall2018CandymancerMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2018Healer: {
    set: 'fall2018CarnivorousPlantSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2019Rogue: {
    set: 'winter2019PoinsettiaSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Warrior: {
    set: 'winter2019BlizzardSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Mage: {
    set: 'winter2019PyrotechnicSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2019Healer: {
    set: 'winter2019WinterStarSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2019Rogue: {
    set: 'spring2019CloudRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Warrior: {
    set: 'spring2019OrchidWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Mage: {
    set: 'spring2019AmberMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2019Healer: {
    set: 'spring2019RobinHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2019Rogue: {
    set: 'summer2019HammerheadRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Warrior: {
    set: 'summer2019SeaTurtleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Mage: {
    specialClass: 'wizard',
    set: 'summer2019WaterLilyMageSet',
    text: t('weaponSpecialSummer2019MageText'),
    notes: t('weaponSpecialSummer2019MageNotes', { int: 15 }),
    value: 90,
    int: 15,
    per: 0,
    twoHanded: false,
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2019Healer: {
    set: 'summer2019ConchHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2019Rogue: {
    set: 'fall2019OperaticSpecterSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Warrior: {
    set: 'fall2019RavenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Mage: {
    set: 'fall2019CyclopsSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2019Healer: {
    set: 'fall2019LichSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  ks2019: {
    text: t('weaponSpecialKS2019Text'),
    notes: t('weaponSpecialKS2019Notes', { str: 20 }),
    value: 0,
    str: 20,
    canOwn: ownsItem('weapon_special_ks2019'),
  },
  winter2020Rogue: {
    set: 'winter2020LanternSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Warrior: {
    set: 'winter2020EvergreenSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Mage: {
    set: 'winter2020CarolOfTheMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2020Healer: {
    set: 'winter2020WinterSpiceSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2020Rogue: {
    set: 'spring2020LapisLazuliRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Warrior: {
    set: 'spring2020BeetleWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Mage: {
    set: 'spring2020PuddleMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2020Healer: {
    set: 'spring2020IrisHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2020Rogue: {
    set: 'summer2020CrocodileRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Warrior: {
    set: 'summer2020RainbowTroutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Mage: {
    set: 'summer2020OarfishMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2020Healer: {
    set: 'summer2020SeaGlassHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2020Rogue: {
    set: 'fall2020TwoHeadedRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Warrior: {
    set: 'fall2020WraithWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Mage: {
    set: 'fall2020ThirdEyeMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2020Healer: {
    set: 'fall2020DeathsHeadMothHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2021Rogue: {
    set: 'winter2021HollyIvyRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Warrior: {
    set: 'winter2021IceFishingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Mage: {
    set: 'winter2021WinterMoonMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2021Healer: {
    set: 'winter2021ArcticExplorerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2021Rogue: {
    set: 'spring2021TwinFlowerRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Warrior: {
    set: 'spring2021SunstoneWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Mage: {
    set: 'spring2021SwanMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2021Healer: {
    set: 'spring2021WillowHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2021Rogue: {
    set: 'summer2021ClownfishRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Warrior: {
    set: 'summer2021FlyingFishWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Mage: {
    set: 'summer2021NautilusMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2021Healer: {
    set: 'summer2021ParrotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2021Rogue: {
    set: 'fall2021OozeRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Warrior: {
    set: 'fall2021HeadlessWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Mage: {
    set: 'fall2021BrainEaterMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2021Healer: {
    set: 'fall2021FlameSummonerHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2022Rogue: {
    set: 'winter2022FireworksRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Warrior: {
    set: 'winter2022StockingWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Mage: {
    set: 'winter2022PomegranateMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2022Healer: {
    set: 'winter2022IceCrystalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2022Rogue: {
    set: 'spring2022MagpieRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Warrior: {
    set: 'spring2022RainstormWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Mage: {
    set: 'spring2022ForsythiaMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2022Healer: {
    set: 'spring2022PeridotHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2022Rogue: {
    set: 'summer2022CrabRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Warrior: {
    set: 'summer2022WaterspoutWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Mage: {
    set: 'summer2022MantaRayMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  summer2022Healer: {
    set: 'summer2022AngelfishHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'summer',
  },
  fall2022Rogue: {
    set: 'fall2022KappaRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Warrior: {
    set: 'fall2022OrcWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Mage: {
    set: 'fall2022HarpyMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  fall2022Healer: {
    set: 'fall2022WatcherHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'fall',
  },
  winter2023Rogue: {
    set: 'winter2023RibbonRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Warrior: {
    set: 'winter2023WalrusWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Mage: {
    set: 'winter2023FairyLightsMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  winter2023Healer: {
    set: 'winter2023CardinalHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'winter',
  },
  spring2023Rogue: {
    set: 'spring2023CaterpillarRogueSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Warrior: {
    set: 'spring2023HummingbirdWarriorSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Mage: {
    set: 'spring2023MoonstoneMageSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  spring2023Healer: {
    set: 'spring2023LilyHealerSet',
    canBuy: () => CURRENT_EVENT && CURRENT_EVENT.season === 'spring',
  },
  summer2023Rogue: {
    set: 'summer2023GuppyRogueSet',
  },
  summer2023Warrior: {
    set: 'summer2023GoldfishWarriorSet',
  },
  summer2023Mage: {
    set: 'summer2023CoralMageSet',
  },
  summer2023Healer: {
    set: 'summer2023KelpHealerSet',
  },
};

const weaponStats = {
  healer: { int: 9 },
  rogue: { str: 8 },
  warrior: { str: 15 },
  wizard: { int: 15, per: 7 },
};

const weaponCosts = {
  healer: 90,
  rogue: 80,
  warrior: 90,
  wizard: 160,
};

Object.keys(gearEvents).forEach(event => {
  CLASSES.forEach(klass => {
    const classNameString = getClassName(klass);
    const eventString = `${event}${upperFirst(classNameString)}`;
    const textString = `weaponSpecial${upperFirst(event)}${upperFirst(classNameString)}`;
    defaults(weapon[eventString], {
      event: gearEvents[event],
      specialClass: klass,
      text: t(`${textString}Text`),
      notes: t(`${textString}Notes`, weaponStats[klass]),
      value: weaponCosts[klass],
      twoHanded: klass === 'wizard',
    }, weaponStats[klass]);
    if (weapon[eventString].canBuy && weapon[eventString].canBuy()) {
      weapon[eventString].event = CURRENT_EVENT;
    }
  });
});

export {
  armor,
  back,
  body,
  eyewear,
  head,
  headAccessory,
  shield,
  weapon,
};
