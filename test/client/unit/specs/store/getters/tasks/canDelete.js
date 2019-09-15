import generateStore from 'client/store';

describe('canDelete getter', () => {
  it('cannot delete active challenge task', () => {
    const store = generateStore();


    const task = {userId: 1, challenge: {id: 2}};
    expect(store.getters['tasks:canDelete'](task)).to.equal(false);
  });

  it('can delete broken challenge task', () => {
    const store = generateStore();


    const task = {userId: 1, challenge: {id: 2, broken: true}};
    expect(store.getters['tasks:canDelete'](task)).to.equal(true);
  });
});
