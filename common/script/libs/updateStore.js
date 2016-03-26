import _ from 'lodash';
import content from '../content/index';

// Return the list of gear items available for purchase

let sortOrder = _.reduce(content.gearTypes, (accumulator, val, key) => {
  accumulator[val] = key;
  return accumulator;
}, {});

module.exports = function updateStore (user) {
  let changes = [];

  _.each(content.gearTypes, (type) => {
    let found = _.find(content.gear.tree[type][user.stats.class], (item) => {
      return !user.items.gear.owned[item.key];
    });

    if (found) changes.push(found);
  });

  changes = changes.concat(_.filter(content.gear.flat, (val) => {
    if (['special', 'mystery', 'armoire'].indexOf(val.klass) !== -1 && !user.items.gear.owned[val.key] && (val.canOwn ? val.canOwn(user) : false)) {
      return true;
    } else {
      return false;
    }
  }));

  return _.sortBy(changes, (change) => sortOrder[change.type]);
};
