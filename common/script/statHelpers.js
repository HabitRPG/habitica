/*
  ------------------------------------------------------
  Level cap
  ------------------------------------------------------
 */

export const maxLevel = 100;

export function capByLevel (lvl) {
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

export const MAX_HEALTH = 50;

/*
  ------------------------------------------------------
  Scoring
  ------------------------------------------------------
 */

export function toNextLevel (lvl) {
  return Math.round((Math.pow(lvl, 2) * 0.25 + 10 * lvl + 139.75) / 10) * 10;
}

/*
  A hyperbola function that creates diminishing returns, so you can't go to infinite (eg, with Exp gain).
  {max} The asymptote
  {bonus} All the numbers combined for your point bonus (eg, task.value * user.stats.int * critChance, etc)
  {halfway} (optional) the point at which the graph starts bending
 */

export function diminishingReturns (bonus, max, halfway = max/2) {
  return max * (bonus / (bonus + halfway));
}
