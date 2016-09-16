import _ from 'lodash';
import content from '../content/index';
import * as statHelpers from '../statHelpers';

module.exports = function statsComputed (user) {
  let paths = ['stats', 'stats.buffs', 'items.gear.equipped.weapon', 'items.gear.equipped.armor',
               'items.gear.equipped.head', 'items.gear.equipped.shield'];
  let computed = _.reduce(['per', 'con', 'str', 'int'], (m, stat) => {
    m[stat] = _.reduce(paths, (m2, path) => {
      let val = _.get(user, path);
      let item = content.gear.flat[val];
      if (!item) item = {};
      if (!item[stat]) {
        item[stat] = 0;
      } else {
        item[stat] = Number(item[stat]);
      }
      let thisMultiplier = item.klass === user.stats.class || item.specialClass === user.stats.class ? 1.5 : 1;
      let thisReturn = path.indexOf('items.gear') !== -1 ? item[stat] * thisMultiplier : Number(val[stat]);
      return m2 + thisReturn || 0;
    }, 0);
    m[stat] += Math.floor(statHelpers.capByLevel(user.stats.lvl) / 2);
    return m;
  }, {});

  computed.maxMP = computed.int * 2 + 30;
  return computed;
};
