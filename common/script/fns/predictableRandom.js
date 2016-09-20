import _ from 'lodash';

// Because the same op needs to be performed on the client and the server (critical hits, item drops, etc),
// we need things to be "random", but technically predictable so that they don't go out-of-sync

module.exports = function predictableRandom (user, seed) {
  if (!seed || seed === Math.PI) {
    let stats = user.stats.toObject ? user.stats.toObject() : user.stats;
    // These items are not part of the stat object but exists on the server (see controllers/user#getUser)
    // we remove them in order to use the same user.stats both on server and on client
    stats = _.omit(stats, 'toNextLevel', 'maxHealth', 'maxMP');

    seed = _.reduce(stats, (accumulator, val) => {
      if (_.isNumber(val)) {
        return accumulator + val;
      } else {
        return accumulator;
      }
    }, 0);
  }

  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};
