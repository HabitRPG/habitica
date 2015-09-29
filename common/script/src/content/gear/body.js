import {translator as t} from '../helpers';
import events from '../events';

import {back as baseBody} from './sets/base';

let body = {
  base: baseBody,
  special: {
    wondercon_red: {
      text: t('bodySpecialWonderconRedText'),
      notes: t('bodySpecialWonderconRedNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    wondercon_gold: {
      text: t('bodySpecialWonderconGoldText'),
      notes: t('bodySpecialWonderconGoldNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    wondercon_black: {
      text: t('bodySpecialWonderconBlackText'),
      notes: t('bodySpecialWonderconBlackNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    summerHealer: {
      event: events.summer,
      specialClass: 'healer',
      text: t('bodySpecialSummerHealerText'),
      notes: t('bodySpecialSummerHealerNotes'),
      value: 20
    },
    summerMage: {
      event: events.summer,
      specialClass: 'wizard',
      text: t('bodySpecialSummerMageText'),
      notes: t('bodySpecialSummerMageNotes'),
      value: 20
    },
    summer2015Healer: {
      event: events.summer2015,
      specialClass: 'healer',
      text: t('bodySpecialSummer2015HealerText'),
      notes: t('bodySpecialSummer2015HealerNotes'),
      value: 20
    },
    summer2015Mage: {
      event: events.summer2015,
      specialClass: 'wizard',
      text: t('bodySpecialSummer2015MageText'),
      notes: t('bodySpecialSummer2015MageNotes'),
      value: 20
    },
    summer2015Rogue: {
      event: events.summer2015,
      specialClass: 'rogue',
      text: t('bodySpecialSummer2015RogueText'),
      notes: t('bodySpecialSummer2015RogueNotes'),
      value: 20
    },
    summer2015Warrior: {
      event: events.summer2015,
      specialClass: 'warrior',
      text: t('bodySpecialSummer2015WarriorText'),
      notes: t('bodySpecialSummer2015WarriorNotes'),
      value: 20
    }
  }
};

export default body;

