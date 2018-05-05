import generateStore from 'client/store';

describe('getTagsFor getter', () => {
  it('returns the tags for a task', () => {
    const store = generateStore();
    store.state.user.data = {
      tags: [
        {id: 1, name: 'tag 1'},
        {id: 2, name: 'tag 2'},
      ],
    };

    const task = {tags: [2]};
    expect(store.getters['tasks:getTagsFor'](task)).to.deep.equal(['tag 2']);
  });
});