import appliedTags from '../../../website/common/script/libs/appliedTags';

describe('appliedTags', () => {
  it('returns the tasks', () => {
    const userTags = [{ id: 'tag1', name: 'tag 1' }, { id: 'tag2', name: 'tag 2' }, { id: 'tag3', name: 'tag 3' }];
    const taskTags = ['tag2', 'tag3'];
    const result = appliedTags(userTags, taskTags);
    expect(result).to.eql('tag 2, tag 3');
  });
});
