import generateStore from '@/store';

describe('canEdit getter', () => {
  let store;
  let group;
  let challenge;
  let task;

  beforeEach(() => {
    store = generateStore();

    store.state.user.data = {
      id: 10,
      contributor: {
        admin: false,
      },
    };

    group = {
      leader: {
        _id: 123,
      },
      managers: {
        123984: {},
      },
    };

    challenge = {
      leader: {
        id: 123,
      },
    };

    task = { userId: 1, challenge: { id: 2 } };
  });
  it('can Edit task in own dashboard', () => {
    expect(store.getters['tasks:canEdit'](task, 'challenge', true, null, challenge)).to.equal(true);
  });

  it('cannot Edit group task in own dashboard', () => {
    expect(store.getters['tasks:canEdit'](task, 'group', true, group, null)).to.equal(false);
  });

  it('can Edit any challenge task if admin', () => {
    store.state.user.data.permissions = { challengeAdmin: true };

    expect(store.getters['tasks:canEdit'](task, 'challenge', true, null, challenge)).to.equal(true);
    expect(store.getters['tasks:canEdit'](task, 'challenge', false, null, challenge)).to.equal(true);
  });

  it('can Edit own challenge task if leader', () => {
    store.state.user.data.id = 123;

    expect(store.getters['tasks:canEdit'](task, 'challenge', true, null, challenge)).to.equal(true);
    expect(store.getters['tasks:canEdit'](task, 'challenge', false, null, challenge)).to.equal(true);
  });

  it('cannot Edit challenge task if not leader on challenge page', () => {
    expect(store.getters['tasks:canEdit'](task, 'challenge', false, null, challenge)).to.equal(false);
  });

  it('can Edit group task as leader on group page', () => {
    store.state.user.data.id = 123;

    expect(store.getters['tasks:canEdit'](task, 'group', false, group)).to.equal(true);
  });

  it('can Edit group task if manager on group page', () => {
    store.state.user.data.id = 123984;

    expect(store.getters['tasks:canEdit'](task, 'group', false, group)).to.equal(true);
  });

  it('cannot Edit group task if not leader on group page', () => {
    expect(store.getters['tasks:canEdit'](task, 'group', false, group)).to.equal(false);
  });
});
