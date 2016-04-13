import {
  generateUser,
  resetHabiticaDB,
  generateGroup,
} from '../../../../helpers/api-v3-integration.helper';
import {
  TAVERN_ID,
} from '../../../../../website/src/models/group';

describe('GET /groups', () => {
  let user;
  const NUMBER_OF_PUBLIC_GUILDS = 3;
  const NUMBER_OF_USERS_PRIVATE_GUILDS = 1;
  const NUMBER_OF_GROUPS_USER_CAN_VIEW = 5;

  before(async () => {
    await resetHabiticaDB();

    let leader = await generateUser({ balance: 10 });
    user = await generateUser({balance: 4});

    let publicGuildUserIsMemberOf = await generateGroup(leader, {
      name: 'public guild - is member',
      type: 'guild',
      privacy: 'public',
    });
    await leader.post(`/groups/${publicGuildUserIsMemberOf._id}/invite`, { uuids: [user._id]});
    await user.post(`/groups/${publicGuildUserIsMemberOf._id}/join`);

    await generateGroup(leader, {
      name: 'public guild - is not member',
      type: 'guild',
      privacy: 'public',
    });

    let privateGuildUserIsMemberOf = await generateGroup(leader, {
      name: 'private guild - is member',
      type: 'guild',
      privacy: 'private',
    });
    await leader.post(`/groups/${privateGuildUserIsMemberOf._id}/invite`, { uuids: [user._id]});
    await user.post(`/groups/${privateGuildUserIsMemberOf._id}/join`);

    await generateGroup(leader, {
      name: 'private guild - is not member',
      type: 'guild',
      privacy: 'private',
    });

    await generateGroup(leader, {
      name: 'party - is not member',
      type: 'party',
      privacy: 'private',
    });

    await user.post('/groups', {
      name: 'party - is member',
      type: 'party',
      privacy: 'private',
    });
  });

  it('returns error when no query passed in', async () => {
    await expect(user.get('/groups'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns only the tavern when tavern passed in as query', async () => {
    await expect(user.get('/groups?type=tavern'))
      .to.eventually.have.a.lengthOf(1)
      .and.to.have.deep.property('[0]')
      .and.to.have.property('_id', TAVERN_ID);
  });

  it('returns only the user\'s party when party passed in as query', async () => {
    await expect(user.get('/groups?type=party'))
      .to.eventually.have.a.lengthOf(1)
      .and.to.have.deep.property('[0]');
  });

  it('returns all public guilds when publicGuilds passed in as query', async () => {
    await expect(user.get('/groups?type=publicGuilds'))
      .to.eventually.have.a.lengthOf(NUMBER_OF_PUBLIC_GUILDS);
  });

  it('returns all private guilds user is a part of when privateGuilds passed in as query', async () => {
    await expect(user.get('/groups?type=privateGuilds'))
      .to.eventually.have.a.lengthOf(NUMBER_OF_USERS_PRIVATE_GUILDS);
  });

  it('returns a list of groups user has access to', async () => {
    await expect(user.get('/groups?type=privateGuilds,publicGuilds,party,tavern'))
      .to.eventually.have.lengthOf(NUMBER_OF_GROUPS_USER_CAN_VIEW);
  });
});
