import { TAVERN_ID } from '../../../../../website/server/models/group';
import { updateDocument } from '../../../../helpers/mongo';
import {
  requester,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';

describe('GET /world-state', () => {
  before(async () => {
    await resetHabiticaDB();
  });

  it('returns empty worldBoss object when world boss is not active (and does not require authentication)', async () => {
    const res = await requester().get('/world-state');
    expect(res.worldBoss).to.eql({});
  });

  it('returns Tavern quest data when world boss is active', async () => {
    await updateDocument('groups', { _id: TAVERN_ID }, { quest: { active: true, key: 'dysheartener', progress: { hp: 50000, rage: 9999 } } });

    const res = await requester().get('/world-state');
    expect(res).to.have.nested.property('worldBoss');

    expect(res.worldBoss).to.eql({
      active: true,
      extra: {},
      key: 'dysheartener',
      progress: {
        collect: {},
        hp: 50000,
        rage: 9999,
      },
    });
  });

  it('returns a string representing the current season for NPC sprites', async () => {
    const res = await requester().get('/world-state');

    expect(res).to.have.nested.property('npcImageSuffix');
    expect(res.npcImageSuffix).to.be.a('string');
  });
});
