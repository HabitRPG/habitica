import each from 'lodash/each';
import lodashFind from 'lodash/find';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import reduce from 'lodash/reduce';
import content from '../content/index';

// Return the list of gear items available for purchase
// TODO: Remove updateStore once the new client is live

let sortOrder = reduce(content.gearTypes, (accumulator, val, key) => {
  accumulator[val] = key;
  return accumulator;
}, {});

module.exports = function updateStore (user) {
  let changes = [];

  each(content.gearTypes, (type) => {
    let found = lodashFind(content.gear.tree[type][user.stats.class], (item) => {
      return !user.items.gear.owned[item.key];
    });

    if (found) changes.push(found);
  });

  changes = changes.concat(filter(content.gear.flat, (val) => {
    if (['special', 'mystery', 'armoire'].indexOf(val.klass) !== -1 && !user.items.gear.owned[val.key] && (val.canOwn ? val.canOwn(user) : false)) {
      return true;
    } else {
      return false;
    }
  }));

  return sortBy(changes, (change) => sortOrder[change.type]);
};
