import predictableRandom from './predictableRandom';

module.exports = function crit (user, stat = 'str', chance = 0.03) {
  let s = user._statsComputed[stat];
  if (predictableRandom(user) <= chance * (1 + s / 100)) {
    return 1.5 + 4 * s / (s + 200);
  } else {
    return 1;
  }
};
