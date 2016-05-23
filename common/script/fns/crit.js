module.exports = function(user, stat, chance) {
  var s;
  if (stat == null) {
    stat = 'str';
  }
  if (chance == null) {
    chance = .03;
  }
  s = user._statsComputed[stat];
  if (user.fns.predictableRandom() <= chance * (1 + s / 100)) {
    return 1.5 + 4 * s / (s + 200);
  } else {
    return 1;
  }
};
