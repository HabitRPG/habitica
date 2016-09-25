import randomVal from '../../../website/common/script/fns/randomVal';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.randomVal', () => {
  let obj;

  beforeEach(() => {
    obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns a random value from an object', () => {
    let result = randomVal(obj);
    expect(result).to.be.oneOf([1, 2, 3, 4]);
  });

  it('uses Math.random to determine the property', () => {
    sandbox.spy(Math, 'random');

    randomVal(obj);

    expect(Math.random).to.be.calledOnce;
  });

  it('can pass in a custom random function that takes in the user and a seed argument', () => {
    let user = generateUser();
    let randomSpy = sandbox.stub().returns(0.3);
    sandbox.spy(Math, 'random');

    let result = randomVal(obj, {
      user,
      seed: 100,
      randomFunc: randomSpy,
    });

    expect(Math.random).to.not.be.called;
    expect(randomSpy).to.be.calledOnce;
    expect(randomSpy).to.be.calledWith(user, 100);
    expect(result).to.equal(2);
  });

  it('returns a random key when the key option is passed in', () => {
    let result = randomVal(obj, { key: true });
    expect(result).to.be.oneOf(['a', 'b', 'c', 'd']);
  });
});
