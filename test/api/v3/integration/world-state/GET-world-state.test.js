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
    sinon.stub(worldState, 'getWorldBoss').returns({
      active: true, extra: {}, key: 'dysheartener', progress: { hp: 50000, rage: 9999, collect: {} },
    });

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
    worldState.getWorldBoss.restore();
  });

  it('calls getRepeatingEvents for data', async () => {
    const getRepeatingEventsOnDate = sinon.stub(common.content, 'getRepeatingEventsOnDate').returns([]);
    const getCurrentGalaEvent = sinon.stub(common.schedule, 'getCurrentGalaEvent').returns({});

    await requester().get('/world-state');

    expect(getRepeatingEventsOnDate).to.have.been.calledOnce;
    expect(getCurrentGalaEvent).to.have.been.calledOnce;

    getRepeatingEventsOnDate.restore();
    getCurrentGalaEvent.restore();
  });

  context('no current event', () => {
    beforeEach(async () => {
      sinon.stub(worldState, 'getCurrentEventList').returns([]);
    });

    afterEach(() => {
      worldState.getCurrentEventList.restore();
    });

    it('returns null for the current event when there is none active', async () => {
      const res = await requester().get('/world-state');

      expect(res.currentEvent).to.be.null;
    });
  });

  context('active event', () => {
    const evt = {
      ...common.content.events.fall2020,
      event: 'fall2020',
    };

    beforeEach(async () => {
      sinon.stub(worldState, 'getCurrentEventList').returns([evt]);
    });

    afterEach(() => {
      worldState.getCurrentEventList.restore();
    });

    it('returns the current event when there is an active one', async () => {
      const res = await requester().get('/world-state');

      expect(res.currentEvent).to.eql(evt);
    });
  });

  context('active event with NPC image suffix', () => {
    const evt = {
      ...common.content.events.fall2020,
      event: 'fall2020',
      npcImageSuffix: 'fall',
    };

    beforeEach(async () => {
      sinon.stub(worldState, 'getCurrentEventList').returns([evt]);
    });

    afterEach(() => {
      worldState.getCurrentEventList.restore();
    });

    it('returns the NPC image suffix when present', async () => {
      const res = await requester().get('/world-state');

      expect(res.npcImageSuffix).to.equal('fall');
    });

    it('returns the NPC image suffix with multiple events present', async () => {
      const evt2 = {
        ...common.content.events.winter2020,
        event: 'test',
      };

      const evt3 = {
        ...common.content.events.winter2020,
        event: 'winter2020',
        npcImageSuffix: 'winter',
      };

      worldState.getCurrentEventList.returns([evt, evt2, evt3]);

      const res = await requester().get('/world-state');

      expect(res.npcImageSuffix).to.equal('fall');
    });
  });
});
