import moment from 'moment';
import t from './translation';
import { EVENTS } from './constants';

/*
 ---------------------------------------------------------------
 Discounted Item Bundles
 ---------------------------------------------------------------
*/

const bundles = {
  featheredFriends: {
    key: 'featheredFriends',
    text: t('featheredFriendsText'),
    notes: t('featheredFriendsNotes'),
    bundleKeys: [
      'falcon',
      'harpy',
      'owl',
    ],
    event: EVENTS.potions202105,
    canBuy () {
      return moment().isBefore(EVENTS.potions202105.end);
    },
    type: 'quests',
    class: 'quest_bundle_featheredFriends',
    value: 7,
  },
  splashyPals: {
    key: 'splashyPals',
    text: t('splashyPalsText'),
    notes: t('splashyPalsNotes'),
    bundleKeys: [
      'dilatory_derby',
      'turtle',
      'whale',
    ],
    event: EVENTS.bundle202106,
    canBuy () {
      return moment().isBefore(EVENTS.bundle202106.end);
    },
    type: 'quests',
    class: 'quest_bundle_splashyPals',
    value: 7,
  },
  farmFriends: {
    key: 'farmFriends',
    text: t('farmFriendsText'),
    notes: t('farmFriendsNotes'),
    bundleKeys: [
      'cow',
      'horse',
      'sheep',
    ],
    canBuy () {
      return moment().isBetween('2019-08-08', '2019-09-02');
    },
    type: 'quests',
    value: 7,
  },
  witchyFamiliars: {
    key: 'witchyFamiliars',
    text: t('witchyFamiliarsText'),
    notes: t('witchyFamiliarsNotes'),
    bundleKeys: [
      'rat',
      'spider',
      'frog',
    ],
    canBuy () {
      return moment().isBetween('2019-10-15', '2019-11-02');
    },
    type: 'quests',
    value: 7,
  },
  winterQuests: {
    key: 'winterQuests',
    text: t('winterQuestsText'),
    notes: t('winterQuestsNotes'),
    addlNotes: t('evilSantaAddlNotes'),
    bundleKeys: [
      'evilsanta',
      'evilsanta2',
      'penguin',
    ],
    canBuy () {
      return moment().isBetween('2022-01-11T08:00-05:00', '2022-01-31T20:00-05:00');
    },
    type: 'quests',
    value: 7,
  },
  hugabug: {
    key: 'hugabug',
    text: t('hugabugText'),
    notes: t('hugabugNotes'),
    bundleKeys: [
      'snail',
      'beetle',
      'butterfly',
    ],
    canBuy () {
      return moment().isBetween('2020-03-09', '2020-04-02');
    },
    type: 'quests',
    value: 7,
  },
  cuddleBuddies: {
    key: 'cuddleBuddies',
    text: t('cuddleBuddiesText'),
    notes: t('cuddleBuddiesNotes'),
    bundleKeys: [
      'bunny',
      'ferret',
      'guineapig',
    ],
    canBuy () {
      return moment().isBetween('2022-03-15T08:00-04:00', '2022-03-31T20:00-04:00');
    },
    type: 'quests',
    value: 7,
  },
  aquaticAmigos: {
    key: 'aquaticAmigos',
    text: t('aquaticAmigosText'),
    notes: t('aquaticAmigosNotes'),
    bundleKeys: [
      'axolotl',
      'kraken',
      'octopus',
    ],
    event: EVENTS.bundle202206,
    canBuy () {
      return moment().isBefore(EVENTS.bundle202206.end);
    },
    type: 'quests',
    value: 7,
  },
  forestFriends: {
    key: 'forestFriends',
    text: t('forestFriendsText'),
    notes: t('forestFriendsNotes'),
    bundleKeys: [
      'ghost_stag',
      'hedgehog',
      'treeling',
    ],
    canBuy () {
      return moment().isBetween('2018-09-11', '2018-10-02');
    },
    type: 'quests',
    value: 7,
  },
  oddballs: {
    key: 'oddballs',
    text: t('oddballsText'),
    notes: t('oddballsNotes'),
    bundleKeys: [
      'slime',
      'rock',
      'yarn',
    ],
    canBuy () {
      return moment().isBetween('2021-03-16T08:00-05:00', '2021-03-31T20:00-05:00');
    },
    type: 'quests',
    value: 7,
  },
  birdBuddies: {
    key: 'birdBuddies',
    text: t('birdBuddiesText'),
    notes: t('birdBuddiesNotes'),
    bundleKeys: [
      'peacock',
      'penguin',
      'rooster',
    ],
    event: EVENTS.bundle202109,
    canBuy () {
      return moment().isBefore(EVENTS.bundle202109.end);
    },
    type: 'quests',
    value: 7,
  },
  mythicalMarvels: {
    key: 'mythicalMarvels',
    text: t('mythicalMarvelsText'),
    notes: t('mythicalMarvelsNotes'),
    bundleKeys: [
      'unicorn',
      'seaserpent',
      'gryphon',
    ],
    canBuy () {
      return moment().isBefore('2022-02-28T20:00-05:00');
    },
    type: 'quests',
    value: 7,
  },
  rockingReptiles: {
    key: 'rockingReptiles',
    text: t('rockingReptilesText'),
    notes: t('rockingReptilesNotes'),
    bundleKeys: [
      'alligator',
      'snake',
      'velociraptor',
    ],
    canBuy () {
      return moment().isBetween('2019-09-10', '2019-10-02');
    },
    type: 'quests',
    value: 7,
  },
  delightfulDinos: {
    key: 'delightfulDinos',
    text: t('delightfulDinosText'),
    notes: t('delightfulDinosNotes'),
    bundleKeys: [
      'pterodactyl',
      'triceratops',
      'trex_undead',
    ],
    canBuy () {
      return moment().isBetween('2022-05-16', '2022-05-31');
    },
    type: 'quests',
    value: 7,
  },
  jungleBuddies: {
    key: 'jungleBuddies',
    text: t('jungleBuddiesText'),
    notes: t('jungleBuddiesNotes', { date: moment('2020-05-31').format('LL') }),
    bundleKeys: [
      'monkey',
      'sloth',
      'treeling',
    ],
    canBuy () {
      return moment().isBetween('2020-05-19', '2020-06-02');
    },
    type: 'quests',
    value: 7,
  },
  sandySidekicks: {
    key: 'sandySidekicks',
    text: t('sandySidekicksText'),
    notes: t('sandySidekicksNotes', { date: moment('2020-10-31').format('LL') }),
    bundleKeys: [
      'armadillo',
      'snake',
      'spider',
    ],
    canBuy () {
      return moment().isBetween('2020-10-13', '2020-11-02');
    },
    type: 'quests',
    value: 7,
  },
};

export default bundles;
