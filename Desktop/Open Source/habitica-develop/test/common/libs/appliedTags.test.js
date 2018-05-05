import appliedTags from '../../../website/common/script/libs/appliedTags';

describe('appliedTags', () => {
  it('returns the tasks', () => {
    let userTags = [{ id: 'tag1', name: 'tag 1' }, { id: 'tag2', name: 'tag 2' }, { id: 'tag3', name: 'tag 3' }];
    let taskTags = ['tag2', 'tag3'];
    let result = appliedTags(userTags, taskTags);
    expect(result).to.eql('tag 2, tag 3');
  });
});
