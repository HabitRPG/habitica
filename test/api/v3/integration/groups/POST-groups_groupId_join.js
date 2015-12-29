import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /group/:groupId/join', () => {
  context('Accepting invitation to a guild', () => {
    let user, invitedUser, guild;

    beforeEach(async () => {
      user = await generateUser({balance: 1});
      guild = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
      });
      invitedUser = await generateUser({
        'invitations.guilds': [{ id: guild._id}],
      });
    });

    it('does not give basilist quest to inviter when joining a guild', async () => {
      await invitedUser.post(`/groups/${guild._id}/join`);

      await expect(user.get('/user')).to.eventually.not.have.deep.property('items.quests.basilist');
    });

    it('does not increment basilist quest count to inviter with basilist when joining a guild', async () => {
      user.update({ 'items.quests.basilist': 1 });

      await invitedUser.post(`/groups/${guild._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
    });
  });

  context('Accepting invitation to a party', () => {
    let user, invitedUser, party;

    beforeEach(async () => {
      user = await generateUser();
      party = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });
      invitedUser = await generateUser({
        'invitations.party': { id: party._id, inviter: user._id },
      });
    });

    it('gives basilist quest item to the inviter when joining a party', async () => {
      await invitedUser.post(`/groups/${party._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
    });

    it('increments basilist quest item count to inviter when joining a party', async () => {
      user.update({'items.quests.basilist': 1 });

      await invitedUser.post(`/groups/${party._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 2);
    });
  });
});
