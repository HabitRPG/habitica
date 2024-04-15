import find from 'lodash/find';
import moment from 'moment';
import { EVENTS } from '../constants/events';
import t from '../translation';

const CURRENT_EVENT = find(EVENTS, event => moment()
  .isBetween(event.start, event.end) && Boolean(event.season));

const QUEST_SEASONAL = {
  // winter
  evilsanta: {
    event: CURRENT_EVENT && CURRENT_EVENT.season === 'winter' ? CURRENT_EVENT : null,
    canBuy () {
      return this.event && moment().isBetween(this.event.start, this.event.end);
    },
    text: t('questEvilSantaText'),
    notes: t('questEvilSantaNotes'),
    addlNotes: t('evilSantaAddlNotes'),
    completion: t('questEvilSantaCompletion'),
    value: 4,
    category: 'pet',
    boss: {
      name: t('questEvilSantaBoss'),
      hp: 300,
      str: 1,
    },
    drop: {
      items: [
        {
          type: 'mounts',
          key: 'BearCub-Polar',
          text: t('questEvilSantaDropBearCubPolarMount'),
        },
      ],
      gp: 20,
      exp: 100,
    },
  },
  evilsanta2: {
    event: CURRENT_EVENT && CURRENT_EVENT.season === 'winter' ? CURRENT_EVENT : null,
    canBuy () {
      return this.event && moment().isBetween(this.event.start, this.event.end);
    },
    text: t('questEvilSanta2Text'),
    notes: t('questEvilSanta2Notes'),
    addlNotes: t('evilSantaAddlNotes'),
    completion: t('questEvilSanta2Completion'),
    value: 4,
    category: 'pet',
    collect: {
      tracks: {
        text: t('questEvilSanta2CollectTracks'),
        count: 20,
      },
      branches: {
        text: t('questEvilSanta2CollectBranches'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'BearCub-Polar',
          text: t('questEvilSanta2DropBearCubPolarPet'),
        },
      ],
      gp: 20,
      exp: 100,
    },
  },
  // spring
  egg: {
    event: CURRENT_EVENT && CURRENT_EVENT.season === 'spring' ? CURRENT_EVENT : null,
    canBuy () {
      return this.event && moment().isBetween('2024-03-26T08:00-04:00', this.event.end);
    },
    text: t('questEggHuntText'),
    notes: t('questEggHuntNotes'),
    completion: t('questEggHuntCompletion'),
    value: 1,
    category: 'pet',
    collect: {
      plainEgg: {
        text: t('questEggHuntCollectPlainEgg'),
        count: 40,
      },
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg'),
        },
      ],
      gp: 0,
      exp: 0,
    },
  },
  waffle: {
    event: EVENTS.aprilFoolsQuest2024,
    canBuy () {
      return moment().isBetween(EVENTS.aprilFoolsQuest2024.start, EVENTS.aprilFoolsQuest2024.end);
    },
    text: t('questWaffleText'),
    notes: t('questWaffleNotes'),
    completion: t('questWaffleCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questWaffleBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t('questWaffleRageTitle'),
        description: t('questWaffleRageDescription'),
        value: 50,
        progressDrain: 0.5,
        effect: t('questWaffleRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Dessert',
          text: t('questWaffleDropDessertPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Dessert',
          text: t('questWaffleDropDessertPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Dessert',
          text: t('questWaffleDropDessertPotion'),
        },
      ],
      gp: 40,
      exp: 500,
      unlock: t('questWaffleUnlockText'),
    },
  },
  virtualpet: {
    event: EVENTS.aprilFoolsQuest2024,
    canBuy () {
      return moment().isBetween(EVENTS.aprilFoolsQuest2024.start, EVENTS.aprilFoolsQuest2024.end);
    },
    text: t('questVirtualPetText'),
    notes: t('questVirtualPetNotes'),
    completion: t('questVirtualPetCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questVirtualPetBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t('questVirtualPetRageTitle'),
        description: t('questVirtualPetRageDescription'),
        value: 50,
        progressDrain: 0.5,
        effect: t('questVirtualPetRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'VirtualPet',
          text: t('questVirtualPetDropVirtualPetPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'VirtualPet',
          text: t('questVirtualPetDropVirtualPetPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'VirtualPet',
          text: t('questVirtualPetDropVirtualPetPotion'),
        },
      ],
      gp: 40,
      exp: 500,
      unlock: t('questVirtualPetUnlockText'),
    },
  },
  fungi: {
    event: EVENTS.aprilFoolsQuest2024,
    canBuy () {
      return moment().isBetween(EVENTS.aprilFoolsQuest2024.start, EVENTS.aprilFoolsQuest2024.end);
    },
    text: t('questFungiText'),
    notes: t('questFungiNotes'),
    completion: t('questFungiCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questFungiBoss'),
      hp: 500,
      str: 2,
      rage: {
        title: t('questFungiRageTitle'),
        description: t('questFungiRageDescription'),
        value: 50,
        mpDrain: 0.33,
        effect: t('questFungiRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Fungi',
          text: t('questFungiDropFungiPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Fungi',
          text: t('questFungiDropFungiPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Fungi',
          text: t('questFungiDropFungiPotion'),
        },
      ],
      gp: 40,
      exp: 500,
      unlock: t('questFungiUnlockText'),
    },
  },
};

export default QUEST_SEASONAL;
