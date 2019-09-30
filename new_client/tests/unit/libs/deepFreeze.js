import deepFreeze from 'client/libs/deepFreeze';

describe('deepFreeze', () => {
  it('deeply freezes an object', () => {
    let obj = {
      a: 1,
      b () {
        return this.a;
      },
      nested: {
        c: 2,
        nestedTwice: {
          d: 1,
        },
      },
    };

    let result = deepFreeze(obj);
    expect(result).to.equal(obj);

    expect(Object.isFrozen(obj)).to.equal(true);
    expect(Object.isFrozen(obj.nested)).to.equal(true);
    expect(Object.isFrozen(obj.nested.nestedTwice)).to.equal(true);
  });
});