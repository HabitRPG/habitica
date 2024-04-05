import t from './translation';

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
    type: 'quests',
    value: 7,
  },
  jungleBuddies: {
    key: 'jungleBuddies',
    text: t('jungleBuddiesText'),
    notes: t('jungleBuddiesNotes'),
    bundleKeys: [
      'monkey',
      'sloth',
      'treeling',
    ],
    type: 'quests',
    value: 7,
  },
  sandySidekicks: {
    key: 'sandySidekicks',
    text: t('sandySidekicksText'),
    notes: t('sandySidekicksNotes'),
    bundleKeys: [
      'armadillo',
      'snake',
      'spider',
    ],
    type: 'quests',
    value: 7,
  },
};

export default bundles;
