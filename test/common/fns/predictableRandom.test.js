import predictableRandom from '../../../website/common/script/fns/predictableRandom';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.predictableRandom', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns a number', () => {
    expect(predictableRandom(user)).to.be.a('number');
  });

  it('returns the same value when user.stats is the same and no seed is passed', () => {
    user.stats.hp = 43;
    user.stats.gp = 34;

    let val1 = predictableRandom(user);
    let val2 = predictableRandom(user);

    expect(val2).to.equal(val1);
  });

  it('returns a different value when user.stats is not the same and no seed is passed', () => {
    user.stats.hp = 43;
    user.stats.gp = 34;
    let val1 = predictableRandom(user);

    user.stats.gp = 35;
    let val2 = predictableRandom(user);

    expect(val2).to.not.equal(val1);
  });

  it('returns the same value when the same seed is passed', () => {
    let val1 = predictableRandom(user, 4452673762);
    let val2 = predictableRandom(user, 4452673762);

    expect(val2).to.equal(val1);
  });

  it('returns a different value when a different seed is passed', () => {
    let val1 = predictableRandom(user, 4452673761);
    let val2 = predictableRandom(user, 4452673762);

    expect(val2).to.not.equal(val1);
  });
});
