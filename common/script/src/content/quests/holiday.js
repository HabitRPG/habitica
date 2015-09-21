import {each, defaults} from 'lodash';
import capitalize from 'lodash.capitalize';
import {translator as t} from '../helpers';

let holidayQuests = {
  evilsanta: {
    boss: {
      name: t('questEvilSantaBoss'),
      hp: 300,
      str: 1
    },
    drop: {
      items: [
        {
          type: 'mounts',
          key: 'BearCub-Polar',
          text: t('questEvilSantaDropBearCubPolarMount')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  evilsanta2: {
    previous: 'evilsanta',
    collect: {
      tracks: {
        text: t('questEvilSanta2CollectTracks'),
        count: 20
      },
      branches: {
        text: t('questEvilSanta2CollectBranches'),
        count: 10
      }
    },
    drop: {
      items: [
        {
          type: 'pets',
          key: 'BearCub-Polar',
          text: t('questEvilSanta2DropBearCubPolarPet')
        }
      ],
      gp: 20,
      exp: 100
    }
  },
  egg: {
    text: t('questEggHuntText'),
    notes: t('questEggHuntNotes'),
    completion: t('questEggHuntCompletion'),
    value: 1,
    collect: {
      plainEgg: {
        text: t('questEggHuntCollectPlainEgg'),
        count: 100
      }
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }, {
          type: 'eggs',
          key: 'Egg',
          text: t('questEggHuntDropPlainEgg')
        }
      ],
      gp: 0,
      exp: 0
    }
  },
};

each(holidayQuests, (quest, name) => {
  let capitalizedName = capitalize(name);
  let questDefaults = {
    completion: t(`quest${capitalizedName}Completion`),
    canBuy: false,
    category: 'pet',
  };

  defaults(quest, questDefaults);
});


export default holidayQuests;
