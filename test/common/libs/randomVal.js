import randomVal from '../../../website/common/script/libs/randomVal';

describe('randomVal', () => {
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

  it('can pass in a predictable random value', () => {
    sandbox.spy(Math, 'random');

    let result = randomVal(obj, {
      predictableRandom: 0.3,
    });

    expect(Math.random).to.not.be.called;
    expect(result).to.equal(2);
  });

  it('returns a random key when the key option is passed in', () => {
    let result = randomVal(obj, { key: true });
    expect(result).to.be.oneOf(['a', 'b', 'c', 'd']);
  });
});
