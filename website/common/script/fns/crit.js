import predictableRandom from './predictableRandom';
import statsComputed from '../libs/statsComputed'; // eslint-disable-line import/no-cycle

function crit (user, stat = 'str', chance = 0.03) {
  const s = statsComputed(user)[stat];
  if (predictableRandom(user) <= chance * (1 + s / 100)) {
    return 1.5 + (4 * s) / (s + 200);
  }
  return 1;
}

export default { crit };
