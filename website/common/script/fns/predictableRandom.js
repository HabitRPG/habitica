import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import isNumber from 'lodash/isNumber';

// Because the same op needs to be performed on the client and the server
// (critical hits, item drops, etc),
// we need things to be "random", but technically predictable so that they don't go out-of-sync

export default function predictableRandom (user, seed) {
  if (!seed || seed === Math.PI) {
    let stats = user.stats.toObject ? user.stats.toObject() : user.stats;
    // These items are not part of the stat object but exists on the server
    // (see controllers/user#getUser)
    // we remove them in order to use the same user.stats both on server and on client
    stats = omit(stats, ['toNextLevel', 'maxHealth', 'maxMP']);

    seed = reduce(stats, (accumulator, val) => { // eslint-disable-line no-param-reassign
      if (isNumber(val)) {
        return accumulator + val;
      }
      return accumulator;
    }, 0);
  }

  seed += 1; // eslint-disable-line no-param-reassign
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
