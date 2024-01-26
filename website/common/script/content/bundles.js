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
    notes: t('featheredFriendsNotes', { date: moment(EVENTS.bundle202309.end).format('LL') }),
    bundleKeys: [
      'falcon',
      'harpy',
      'owl',
    ],
    event: EVENTS.bundle202309,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202309.start, EVENTS.bundle202309.end);
    },
    type: 'quests',
    class: 'quest_bundle_featheredFriends',
    value: 7,
  },
  splashyPals: {
    key: 'splashyPals',
    text: t('splashyPalsText'),
    notes: t('splashyPalsNotes', { date: moment(EVENTS.bundle202306.end).format('LL') }),
    bundleKeys: [
      'dilatory_derby',
      'turtle',
      'whale',
    ],
    event: EVENTS.bundle202306,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202306.start, EVENTS.bundle202306.end);
    },
    type: 'quests',
    class: 'quest_bundle_splashyPals',
    value: 7,
  },
  farmFriends: {
    key: 'farmFriends',
    text: t('farmFriendsText'),
    notes: t('farmFriendsNotes', { date: moment(EVENTS.bundle202209.end).format('LL') }),
    bundleKeys: [
      'cow',
      'horse',
      'sheep',
    ],
    event: EVENTS.bundle202209,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202209.start, EVENTS.bundle202209.end);
    },
    type: 'quests',
    value: 7,
  },
  witchyFamiliars: {
    key: 'witchyFamiliars',
    text: t('witchyFamiliarsText'),
    notes: t('witchyFamiliarsNotes', { date: moment(EVENTS.bundle202210.end).format('LL') }),
    bundleKeys: [
      'rat',
      'spider',
      'frog',
    ],
    event: EVENTS.bundle202210,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202210.start, EVENTS.bundle202210.end);
    },
    type: 'quests',
    value: 7,
  },
  winterQuests: {
    key: 'winterQuests',
    text: t('winterQuestsText'),
    notes: t('winterQuestsNotes', { date: moment(EVENTS.winter2024.end).format('LL') }),
    addlNotes: t('evilSantaAddlNotes'),
    bundleKeys: [
      'evilsanta',
      'evilsanta2',
      'penguin',
    ],
    event: EVENTS.winter2024,
    canBuy () {
      return moment().isBetween(EVENTS.winter2024.start, EVENTS.winter2024.end);
    },
    type: 'quests',
    value: 7,
  },
  hugabug: {
    key: 'hugabug',
    text: t('hugabugText'),
    notes: t('hugabugNotes', { date: moment(EVENTS.bundle202308.end).format('LL') }),
    bundleKeys: [
      'snail',
      'beetle',
      'butterfly',
    ],
    canBuy () {
      return moment().isBetween(EVENTS.bundle202308.start, EVENTS.bundle202308.end);
    },
    type: 'quests',
    value: 7,
  },
  cuddleBuddies: {
    key: 'cuddleBuddies',
    text: t('cuddleBuddiesText'),
    notes: t('cuddleBuddiesNotes', { date: moment('2022-03-31').format('LL') }), // needs update next time we run this
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
    notes: t('aquaticAmigosNotes', { date: moment(EVENTS.bundle202206.end).format('LL') }),
    bundleKeys: [
      'axolotl',
      'kraken',
      'octopus',
    ],
    event: EVENTS.bundle202206,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202206.start, EVENTS.bundle202206.end);
    },
    type: 'quests',
    value: 7,
  },
  forestFriends: {
    key: 'forestFriends',
    text: t('forestFriendsText'),
    notes: t('forestFriendsNotes', { date: moment(EVENTS.bundle202208.end).format('LL') }),
    bundleKeys: [
      'ghost_stag',
      'hedgehog',
      'treeling',
    ],
    event: EVENTS.bundle202208,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202208.start, EVENTS.bundle202208.end);
    },
    type: 'quests',
    value: 7,
  },
  oddballs: {
    key: 'oddballs',
    text: t('oddballsText'),
    notes: t('oddballsNotes', { date: moment(EVENTS.bundle202311.end).format('LL') }),
    bundleKeys: [
      'slime',
      'rock',
      'yarn',
    ],
    event: EVENTS.bundle202311,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202311.start, EVENTS.bundle202311.end);
    },
    type: 'quests',
    value: 7,
  },
  birdBuddies: {
    key: 'birdBuddies',
    text: t('birdBuddiesText'),
    notes: t('birdBuddiesNotes', { date: moment(EVENTS.bundle202305.end).format('LL') }),
    bundleKeys: [
      'peacock',
      'penguin',
      'rooster',
    ],
    event: EVENTS.bundle202305,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202305.start, EVENTS.bundle202305.end);
    },
    type: 'quests',
    value: 7,
  },
  mythicalMarvels: {
    key: 'mythicalMarvels',
    text: t('mythicalMarvelsText'),
    notes: t('mythicalMarvelsNotes', { date: moment(EVENTS.bundle202402.end).format('LL') }),
    bundleKeys: [
      'unicorn',
      'seaserpent',
      'gryphon',
    ],
    event: EVENTS.bundle202402,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202402.start, EVENTS.bundle202402.end);
    },
    type: 'quests',
    value: 7,
  },
  rockingReptiles: {
    key: 'rockingReptiles',
    text: t('rockingReptilesText'),
    notes: t('rockingReptilesNotes', { date: moment(EVENTS.bundle202211.end).format('LL') }),
    bundleKeys: [
      'alligator',
      'snake',
      'velociraptor',
    ],
    event: EVENTS.bundle202211,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202211.start, EVENTS.bundle202211.end);
    },
    type: 'quests',
    value: 7,
  },
  delightfulDinos: {
    key: 'delightfulDinos',
    text: t('delightfulDinosText'),
    notes: t('delightfulDinosNotes', { date: moment('2022-05-31').format('LL') }), // needs update next time its run
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
    notes: t('jungleBuddiesNotes', { date: moment(EVENTS.bundle202303.end).format('LL') }),
    bundleKeys: [
      'monkey',
      'sloth',
      'treeling',
    ],
    event: EVENTS.bundle202303,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202303.start, EVENTS.bundle202303.end);
    },
    type: 'quests',
    value: 7,
  },
  sandySidekicks: {
    key: 'sandySidekicks',
    text: t('sandySidekicksText'),
    notes: t('sandySidekicksNotes', { date: moment(EVENTS.bundle202310.end).format('LL') }),
    bundleKeys: [
      'armadillo',
      'snake',
      'spider',
    ],
    event: EVENTS.bundle202310,
    canBuy () {
      return moment().isBetween(EVENTS.bundle202310.start, EVENTS.bundle202310.end);
    },
    type: 'quests',
    value: 7,
  },
};

export default bundles;
