import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /group/:groupId/join', () => {
  it('returns error when groupId is not for a valid group', async () => {
    let joiningUser = await generateUser();

    await expect(joiningUser.post(`/groups/${generateUUID()}/join`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  context('Accepting invitation to a guild', () => {
    let user, invitedUser, guild;

    beforeEach(async () => {
      user = await generateUser({balance: 1});
      guild = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'private',
      });
    });

    it('returns error when user is not invited to private guild', async () => {
      let joiningUser = await generateUser();

      await expect(joiningUser.post(`/groups/${guild._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    it('allows non-invited users to join public guilds', async () => {
      await user.update({balance: 1});
      guild = await user.post('/groups', {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'public',
      });

      let joiningUser = await generateUser();
      await joiningUser.post(`/groups/${guild._id}/join`);

      await expect(joiningUser.get('/user')).to.eventually.have.property('guilds').to.include(guild._id);
    });

    context('User is invited', () => {
      beforeEach(async () => {
        invitedUser = await generateUser({
          'invitations.guilds': [{ id: guild._id}],
        });
      });

      it('allows invited user to join private guilds', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.property('guilds').to.include(guild._id);
      });

      it('clears invitation from user when joining guilds', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(invitedUser.get('/user'))
          .to.eventually.have.deep.property('invitations.guilds')
          .to.not.include({id: guild._id});
      });

      it('does not give basilist quest to inviter when joining a guild', async () => {
        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.not.have.deep.property('items.quests.basilist');
      });

      it('does not increment basilist quest count to inviter with basilist when joining a guild', async () => {
        await user.update({ 'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${guild._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
      });
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
    });

    it('returns error when user is not invited to party', async () => {
      let joiningUser = await generateUser();

      await expect(joiningUser.post(`/groups/${party._id}/join`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupRequiresInvite'),
      });
    });

    context('User is invited', () => {
      beforeEach(async () => {
        invitedUser = await generateUser({
          'invitations.party': { id: party._id, inviter: user._id },
        });
      });

      it('allows invited user to join party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.have.deep.property('party._id', party._id);
      });

      it('clears invitation from user when joining party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(invitedUser.get('/user')).to.eventually.not.have.deep.property('invitations.party.id');
      });

      it('gives basilist quest item to the inviter when joining a party', async () => {
        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 1);
      });

      it('increments basilist quest item count to inviter when joining a party', async () => {
        await user.update({'items.quests.basilist': 1 });

        await invitedUser.post(`/groups/${party._id}/join`);

        await expect(user.get('/user')).to.eventually.have.deep.property('items.quests.basilist', 2);
      });
    });
  });
});
