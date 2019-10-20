import generateStore from 'client/store';

describe('canEdit getter', () => {
  it('cannot Edit active challenge task', () => {
    const store = generateStore();


    const task = { userId: 1, challenge: { id: 2 } };
    expect(store.getters['tasks:canEdit'](task, 'challenge', true, null, null)).to.equal(true);
  });

  it('can Edit broken challenge task', () => {
    const store = generateStore();


    const task = { userId: 1, challenge: { id: 2, broken: true } };
    expect(store.getters['tasks:canEdit'](task, 'challenge', true, null, null)).to.equal(true);
  });
});
