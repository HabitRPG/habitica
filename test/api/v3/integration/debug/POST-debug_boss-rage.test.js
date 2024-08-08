import nconf from 'nconf';
import {
  generateUser,
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

describe.only('POST /debug/boss-rage', () => {
  const PET_QUEST = 'trex_undead';
  let user;
  let questingGroup;
  let leader;
  let partyMembers;
  let nconfStub;

  beforeEach(async () => {
    user = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('errors if user is not in a party', async () => {
    await expect(user.post('/debug/boss-rage'))
      .to.eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'User not in a party.',
      });
  });

  context('user joins a party', () => {
    let user; 
    let invitedUser;
    let party;

    beforeEach(async () =>{
      const { group, groupLeader, invitees } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
        invites: 1,
      });
      party = group;
      user = groupLeader;
      [invitedUser] = invitees;
    });

    it('adds user to party', async () => {
      await invitedUser.post(`/groups/${party._id}/join`);
    });

    it('errors if user is not on a quest', async () => {
      await expect(user.post('/debug/quest-progress'))
        .to.eventually.be.rejected.and.to.deep.equal({
          code: 400,
          error: 'BadRequest',
          message: 'User is not on a valid quest.',
        });
    });

    it('joins a quest from an invitation', async () => {
      await leader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);
      await partyMembers[0].post(`/groups/${questingGroup._id}/quests/accept`);

      await Promise.all([partyMembers[0].sync(), questingGroup.sync()]);
      expect(leader.party.quest.RSVPNeeded).to.equal(false);
      expect(questingGroup.quest.members[partyMembers[0]._id]).to.equal(true);
    }),
  }); // why does this curly boi and parentheses throw an unexpected token error? Everything seems to match up...

  context('successfully force starting a quest', () => {
    it('allows quest leader to force start quest', async () => {
      const questLeader = partyMembers[0];
      await questLeader.updateOne({ [`items.quests.${PET_QUEST}`]: 1 });
      await questLeader.post(`/groups/${questingGroup._id}/quests/invite/${PET_QUEST}`);

      await questLeader.post(`/groups/${questingGroup._id}/quests/force-start`);

      await questingGroup.sync();

      expect(questingGroup.quest.active).to.eql(true);
    });
  });

  it('increases boss rage to 50', async () => {
    await user.updateOne({
      'party.quest.key': 'trex_undead',
    });

    await user.post('/debug/boss-rage');
    await user.sync();
    expect(user.party.quest.progress.rage).to.eql(50);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/boss-rage'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
