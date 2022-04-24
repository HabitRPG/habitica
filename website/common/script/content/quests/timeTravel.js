import t from '../translation';

const QUEST_TIME_TRAVEL = {
  robot: {
    text: t('questRobotText'),
    notes: t('questRobotNotes'),
    completion: t('questRobotCompletion'),
    value: 1,
    category: 'timeTravelers',
    canBuy () {
      return false;
    },
    collect: {
      bolt: {
        text: t('questRobotCollectBolts'),
        count: 15,
      },
      gear: {
        text: t('questRobotCollectGears'),
        count: 10,
      },
      spring: {
        text: t('questRobotCollectSprings'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'eggs',
          key: 'Robot',
          text: t('questRobotDropRobotEgg'),
        }, {
          type: 'eggs',
          key: 'Robot',
          text: t('questRobotDropRobotEgg'),
        }, {
          type: 'eggs',
          key: 'Robot',
          text: t('questRobotDropRobotEgg'),
        },
      ],
      gp: 40,
      exp: 75,
      unlock: t('questRobotUnlockText'),
    },
  },
  solarSystem: {
    text: t('questSolarSystemText'),
    notes: t('questSolarSystemNotes'),
    completion: t('questSolarSystemCompletion'),
    value: 1,
    category: 'timeTravelers',
    canBuy () {
      return false;
    },
    boss: {
      name: t('questSolarSystemBoss'),
      hp: 1500,
      str: 2.5,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'SolarSystem',
          text: t('questSolarSystemDropSolarSystemPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'SolarSystem',
          text: t('questSolarSystemDropSolarSystemPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'SolarSystem',
          text: t('questSolarSystemDropSolarSystemPotion'),
        },
      ],
      gp: 90,
      exp: 900,
      unlock: t('questSolarSystemUnlockText'),
    },
  },
  windup: {
    text: t('questWindupText'),
    notes: t('questWindupNotes'),
    completion: t('questWindupCompletion'),
    value: 1,
    category: 'timeTravelers',
    canBuy () {
      return false;
    },
    boss: {
      name: t('questWindupBoss'),
      hp: 1000,
      str: 1,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Windup',
          text: t('questWindupDropWindupPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Windup',
          text: t('questWindupDropWindupPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Windup',
          text: t('questWindupDropWindupPotion'),
        },
      ],
      gp: 50,
      exp: 425,
      unlock: t('questWindupUnlockText'),
    },
  },
};

export default QUEST_TIME_TRAVEL;
