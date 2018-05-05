import noTags from '../../../website/common/script/libs/noTags';

describe('noTags', () => {
  it('returns true for no tags', () => {
    let result = noTags([]);
    expect(result).to.eql(true);
  });

  it('returns false for some tags', () => {
    let result = noTags(['a', 'b', 'c']);
    expect(result).to.eql(false);
  });
});
