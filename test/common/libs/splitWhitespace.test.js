import splitWhitespace from '../../../common/script/libs/splitWhitespace';

describe('splitWhitespace', () => {
  it('returns an array', () => {
    expect(splitWhitespace('a b')).to.eql(['a', 'b']);
  });
});
