import { TAVERN_ID } from '../../../../../website/server/models/group';
import { updateDocument } from '../../../../helpers/mongo';
import {
  requester,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';
import * as worldState from '../../../../../website/server/libs/worldState';
import common from '../../../../../website/common';

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

  context('no current event', () => {
    beforeEach(async () => {
      sinon.stub(worldState, 'getCurrentEvent').returns(null);
    });

    afterEach(() => {
      worldState.getCurrentEvent.restore();
    });

    it('returns null for the current event when there is none active', async () => {
      const res = await requester().get('/world-state');

      expect(res.currentEvent).to.be.null;
    });
  });

  context('no current event', () => {
    const evt = {
      ...common.content.events.fall2020,
      event: 'fall2020',
    };

    beforeEach(async () => {
      sinon.stub(worldState, 'getCurrentEvent').returns(evt);
    });

    afterEach(() => {
      worldState.getCurrentEvent.restore();
    });

    it('returns the current event when there is an active one', async () => {
      const res = await requester().get('/world-state');

      expect(res.currentEvent).to.eql(evt);
    });
  });
});
