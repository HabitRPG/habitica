import pickDeep from '../../../website/common/script/libs/pickDeep';

describe('pickDeep', () => {
  it('throws an error if "properties" is not an array', () => {
    expect(pickDeep).to.throw(Error);
  });

  it('returns an object of properties taken from the input object', () => {
    let obj = {
      a: true,
      b: [1, 2, 3],
      c: {
        nested: {
          two: {
            times: true,
          },
        },
      },
      d: false,
    };

    let res = pickDeep(obj, ['a', 'b[0]', 'c.nested.two.times']);
    expect(res.a).to.be.true;
    expect(res.b).to.eql([1]);
    expect(res.c).to.eql({
      nested: {
        two: {
          times: true,
        },
      },
    });
    expect(res).to.not.have.property('d');
  });
});
