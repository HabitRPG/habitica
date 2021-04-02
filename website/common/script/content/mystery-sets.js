import each from 'lodash/each';
import moment from 'moment';
import t from './translation';

const mysterySets = {
  301404: {
    start: '3014-03-24',
    end: '3014-04-02',
  },
  301405: {
    start: '3014-04-24',
    end: '3014-05-02',
  },
  301703: {
    start: '3017-03-14',
    end: '3017-04-02',
  },
  301704: {
    start: '3017-04-14',
    end: '3017-05-02',
  },
  // @TODO: Remove wondercon from mystery-sets
  wondercon: {
    start: '2014-03-24',
    end: '2014-04-01',
  },
};
const FIRST_MYSTERY_SET = moment('2014-02-01');

for (
  let mysteryMonth = FIRST_MYSTERY_SET;
  moment(mysteryMonth).startOf('month').isSameOrBefore(moment().add(1, 'months'));
  mysteryMonth = moment(mysteryMonth).add(1, 'months')
) {
  const setKey = moment(mysteryMonth).format('YYYYMM');
  mysterySets[setKey] = {
    start: moment(mysteryMonth).startOf('month').format('YYYY-MM-DD'),
    end: moment(mysteryMonth).endOf('month').format('YYYY-MM-DD'),
  };
}

each(mysterySets, (value, key) => {
  value.key = key;
  value.text = t(`mysterySet${key}`);
  value.class = `shop_set_mystery_${key}`;
});

export default mysterySets;
