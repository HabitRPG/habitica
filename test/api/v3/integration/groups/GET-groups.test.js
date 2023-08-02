import {
  createAndPopulateGroup,
  resetHabiticaDB,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /groups', () => {
  let user; let leader; let members;
  let secondGroup; let secondLeader;
  const NUMBER_OF_USERS_PRIVATE_GUILDS = 2;
  const NUMBER_OF_GROUPS_USER_CAN_VIEW = 3;
  const categories = [{
    slug: 'newCat',
    name: 'New Category',
  }];
  let privateGuildUserIsMemberOf;

  before(async () => {
    await resetHabiticaDB();

    ({
      group: privateGuildUserIsMemberOf,
      groupLeader: leader,
      members,
    } = await createAndPopulateGroup({
      groupDetails: {
        name: 'private guild - is member',
        type: 'guild',
        privacy: 'private',
        categories,
      },
      leaderDetails: {
        balance: 10,
      },
      members: 1,
      upgradeToGroupPlan: true,
    }));
    [user] = members;
    await user.update({ balance: 4 });

    ({ group: secondGroup, groupLeader: secondLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'c++ coders',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
    }));

    await secondLeader.post(`/groups/${secondGroup._id}/invite`, { uuids: [user._id] });
    await user.post(`/groups/${secondGroup._id}/join`);

    await createAndPopulateGroup({
      groupDetails: {
        name: 'private guild - is not member',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
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

  it('returns error when an invalid ?type query is passed', async () => {
    await expect(user.get('/groups?type=invalid'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('groupTypesRequired'),
      });
  });

  it('returns only the user\'s party when party passed in as query', async () => {
    await expect(user.get('/groups?type=party'))
      .to.eventually.have.a.lengthOf(1)
      .and.to.have.nested.property('[0]');
  });

  it('returns all the user\'s guilds when guilds passed in as query', async () => {
    await expect(user.get('/groups?type=guilds'))
      .to.eventually.have.a
      .lengthOf(NUMBER_OF_USERS_PRIVATE_GUILDS);
  });

  it('returns all private guilds user is a part of when privateGuilds passed in as query', async () => {
    await expect(user.get('/groups?type=privateGuilds'))
      .to.eventually.have.a.lengthOf(NUMBER_OF_USERS_PRIVATE_GUILDS);
  });

  it('returns a list of groups user has access to', async () => {
    await expect(user.get('/groups?type=privateGuilds,party'))
      .to.eventually.have.lengthOf(NUMBER_OF_GROUPS_USER_CAN_VIEW);
  });

  describe('filters', () => {
    it('returns private guilds filtered by category', async () => {
      const guilds = await user.get(`/groups?type=privateGuilds&categories=${categories[0].slug}`);

      expect(guilds[0]._id).to.equal(privateGuildUserIsMemberOf._id);
    });

    it('filters private guilds by size', async () => {
      const guilds = await user.get('/groups?type=privateGuilds&minMemberCount=3');

      expect(guilds.length).to.equal(0);
    });
  });
});
