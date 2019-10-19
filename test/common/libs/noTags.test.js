import noTags from '../../../website/common/script/libs/noTags';

describe('noTags', () => {
  it('returns true for no tags', () => {
    const result = noTags([]);
    expect(result).to.eql(true);
  });

  it('returns false for some tags', () => {
    const result = noTags(['a', 'b', 'c']);
    expect(result).to.eql(false);
  });
});
