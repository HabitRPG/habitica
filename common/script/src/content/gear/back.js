import t from '../helpers/translator';
import events from '../events';

let back = {
  base: {
    0: {
      text: t('backBase0Text'),
      notes: t('backBase0Notes'),
      value: 0
    }
  },
  mystery: {
    201402: {
      text: t('backMystery201402Text'),
      notes: t('backMystery201402Notes'),
      mystery: '201402',
      value: 0
    },
    201404: {
      text: t('backMystery201404Text'),
      notes: t('backMystery201404Notes'),
      mystery: '201404',
      value: 0
    },
    201410: {
      text: t('backMystery201410Text'),
      notes: t('backMystery201410Notes'),
      mystery: '201410',
      value: 0
    },
    201504: {
      text: t('backMystery201504Text'),
      notes: t('backMystery201504Notes'),
      mystery: '201504',
      value: 0
    },
    201507: {
      text: t('backMystery201507Text'),
      notes: t('backMystery201507Notes'),
      mystery: '201507',
      value: 0
    }
  },
  special: {
    wondercon_red: {
      text: t('backSpecialWonderconRedText'),
      notes: t('backSpecialWonderconRedNotes'),
      value: 0,
      mystery: 'wondercon'
    },
    wondercon_black: {
      text: t('backSpecialWonderconBlackText'),
      notes: t('backSpecialWonderconBlackNotes'),
      value: 0,
      mystery: 'wondercon'
    }
  }
};

export default back;

