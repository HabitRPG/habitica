import generateStore from '@/store';

describe('canDelete getter', () => {
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
  it('cannot Delete challenge or group task in own dashboard', () => {
    expect(store.getters['tasks:canDelete'](task, 'challenge', true, null, challenge)).to.equal(false);
    expect(store.getters['tasks:canDelete'](task, 'group', true, group, null)).to.equal(false);
  });

  it('can Delete any challenge task as admin', () => {
    store.state.user.data.permissions = { challengeAdmin: true };

    expect(store.getters['tasks:canDelete'](task, 'challenge', true, null, challenge)).to.equal(true);
  });

  it('can Delete own challenge task if leader', () => {
    store.state.user.data.id = 123;

    expect(store.getters['tasks:canDelete'](task, 'challenge', false, null, challenge)).to.equal(true);
  });

  it('cannot Delete challenge task if non leader on challenge page', () => {
    expect(store.getters['tasks:canDelete'](task, 'challenge', false, null, challenge)).to.equal(false);
  });

  it('can Delete group task as leader on group page', () => {
    store.state.user.data.id = 123;

    expect(store.getters['tasks:canDelete'](task, 'group', false, group)).to.equal(true);
  });

  it('can Delete group task if manager on group page', () => {
    store.state.user.data.id = 123984;

    expect(store.getters['tasks:canDelete'](task, 'group', false, group)).to.equal(true);
  });

  it('cannot Delete group task if not a leader on group page', () => {
    expect(store.getters['tasks:canDelete'](task, 'group', false, group)).to.equal(false);
  });
});
