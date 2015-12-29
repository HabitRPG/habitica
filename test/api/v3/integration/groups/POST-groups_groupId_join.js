import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /group/:groupId/join', () => {
  let user;
  let group;

  context('Accepting invitation to a guild', () => {
    it('does not give basilist quest to inviter when joining a guild', async () => {
      user = await generateUser({balance: 1});
      group = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
      });

      let invitedUser = await generateUser({
        'invitations.guilds': [{ id: group._id}],
      });
      await invitedUser.post(`/groups/${group._id}/join`);

      await expect(user.get('/user')).to.eventually.not.have.deep.property('items.quests.basilist');
    });

    it('does not increment basilist quest count to inviter with basilist when joining a guild', async () => {
      user = await generateUser({balance: 1, 'items.quests.basilist': 1});
      group = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
      });

      let invitedUser = await generateUser({
        'invitations.guilds': [{ id: group._id}],
      });
      await invitedUser.post(`/groups/${group._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
    });
  });

  context('Accepting invitation to a party', () => {
    it('gives basilist quest item to the inviter when joining a party', async () => {
      user = await generateUser();
      group = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });

      let joiningUser = await generateUser({
        'invitations.party': { id: group._id, inviter: user._id },
      });
      await joiningUser.post(`/groups/${group._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
    });

    it('increments basilist quest item count to inviter with basilist when joining a party', async () => {
      user = await generateUser({'items.quests.basilist': 1 });
      group = await user.post('/groups', {
        name: 'Test Party',
        type: 'party',
      });

      let joiningUser = await generateUser({
        'invitations.party': { id: group._id, inviter: user._id },
      });
      await joiningUser.post(`/groups/${group._id}/join`);

      await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 2);
    });
  });
});
