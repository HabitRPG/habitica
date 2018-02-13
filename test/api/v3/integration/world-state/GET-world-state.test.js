import {
  requester,
  resetHabiticaDB,
  setWorldBoss,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /world-state', () => {
  before(async () => {
    await resetHabiticaDB();
  });

  it('returns empty worldBoss object when world boss is not active (and does not require authentication)', async () => {
    let res = await requester().get('/world-state');
    expect(res).to.have.deep.property('worldBoss');
    expect(res.worldBoss).to.equal({});
  });

  it('returns Tavern quest data including Rage Strike damage when world boss is active', async () => {
    await setWorldBoss({key: 'dysheartener', hp: 500000, rage: 9999});

    let res = await requester().get('/world-state');
    expect(res).to.have.deep.property('worldBoss');

    expect(res.worldBoss).to.equal({
      active: true,
      key: 'dysheartener',
      progress: {
        hp: 50000,
        rage: 9999,
      },
    });
  });
});
