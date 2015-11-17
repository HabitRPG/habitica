/*
  ------------------------------------------------------
  Level cap
  ------------------------------------------------------
 */

const maxLevel = 100;

function capByLevel (lvl) {
  if (lvl > maxLevel) {
    return maxLevel;
  } else {
    return lvl;
  }
}

/*
  ------------------------------------------------------
  Health cap
  ------------------------------------------------------
 */

const maxHealth = 50;

/*
  ------------------------------------------------------
  Scoring
  ------------------------------------------------------
 */

function tnl (lvl) {
  return Math.round((Math.pow(lvl, 2) * 0.25 + 10 * lvl + 139.75) / 10) * 10;
}

/*
  A hyperbola function that creates diminishing returns, so you can't go to infinite (eg, with Exp gain).
  {max} The asymptote
  {bonus} All the numbers combined for your point bonus (eg, task.value * user.stats.int * critChance, etc)
  {halfway} (optional) the point at which the graph starts bending
 */

function diminishingReturns (bonus, max, halfway) {
  if (!halfway) {
    halfway = max / 2;
  }
  return max * (bonus / (bonus + halfway));
}

export default {
  maxLevel,
  capByLevel,
  maxHealth,
  tnl,
  diminishingReturns,
};
