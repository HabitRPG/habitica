import _ from 'lodash';
import content from '../content/index';

/*
  Update the in-browser store with new gear. FIXME this was in user.fns, but it was causing strange issues there
 */

var sortOrder = _.reduce(content.gearTypes, (function(m, v, k) {
  m[v] = k;
  return m;
}), {});

module.exports = function(user) {
  var changes;
  if (!user) {
    return;
  }
  changes = [];
  _.each(content.gearTypes, function(type) {
    var found;
    found = _.find(content.gear.tree[type][user.stats["class"]], function(item) {
      return !user.items.gear.owned[item.key];
    });
    if (found) {
      changes.push(found);
    }
    return true;
  });
  changes = changes.concat(_.filter(content.gear.flat, function(v) {
    var ref;
    return ((ref = v.klass) === 'special' || ref === 'mystery' || ref === 'armoire') && !user.items.gear.owned[v.key] && (typeof v.canOwn === "function" ? v.canOwn(user) : void 0);
  }));
  return _.sortBy(changes, function(c) {
    return sortOrder[c.type];
  });
};
