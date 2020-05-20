import {
  generateUser,
  resetHabiticaDB,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import {
  TAVERN_ID,
} from '../../../../../website/server/models/group';
import apiError from '../../../../../website/server/libs/apiError';

describe('GET /groups', () => {
  let user;
  let userInGuild;
  const NUMBER_OF_PUBLIC_GUILDS = 3; // 2 + the tavern
  const NUMBER_OF_PUBLIC_GUILDS_USER_IS_LEADER = 2;
  const NUMBER_OF_PUBLIC_GUILDS_USER_IS_MEMBER = 1;
  const NUMBER_OF_USERS_PRIVATE_GUILDS = 1;
  const NUMBER_OF_GROUPS_USER_CAN_VIEW = 5;
  const GUILD_PER_PAGE = 30;
  const categories = [{
    slug: 'newCat',
    name: 'New Category',
  }];
  let publicGuildNotMember;
  let privateGuildUserIsMemberOf;

  before(async () => {
    await resetHabiticaDB();

    const leader = await generateUser({ balance: 10 });
    user = await generateUser({ balance: 4 });

    const publicGuildUserIsMemberOf = await generateGroup(leader, {
      name: 'public guild - is member',
      type: 'guild',
      privacy: 'public',
      summary: 'ohayou kombonwa',
      description: 'oyasumi',
    });
    await leader.post(`/groups/${publicGuildUserIsMemberOf._id}/invite`, { uuids: [user._id] });
    await user.post(`/groups/${publicGuildUserIsMemberOf._id}/join`);

    userInGuild = await generateUser({ guilds: [publicGuildUserIsMemberOf._id] });

    publicGuildNotMember = await generateGroup(leader, {
      name: 'public guild - is not member',
      type: 'guild',
      privacy: 'public',
      summary: 'Natsume Soseki',
      description: 'Kinnosuke no Hondana',
      categories,
    });

    privateGuildUserIsMemberOf = await generateGroup(leader, {
      name: 'private guild - is member',
      type: 'guild',
      privacy: 'private',
      categories,
    });
    await leader.post(`/groups/${privateGuildUserIsMemberOf._id}/invite`, { uuids: [user._id] });
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

  it('returns error when an invalid ?type query is passed', async () => {
    await expect(user.get('/groups?type=invalid'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('groupTypesRequired'),
      });
  });

  it('returns only the tavern when tavern passed in as query', async () => {
    await expect(user.get('/groups?type=tavern'))
      .to.eventually.have.a.lengthOf(1)
      .and.to.have.nested.property('[0]')
      .and.to.have.property('_id', TAVERN_ID);
  });

  it('returns only the user\'s party when party passed in as query', async () => {
    await expect(user.get('/groups?type=party'))
      .to.eventually.have.a.lengthOf(1)
      .and.to.have.nested.property('[0]');
  });

  it('returns all public guilds when publicGuilds passed in as query', async () => {
    await expect(user.get('/groups?type=publicGuilds'))
      .to.eventually.have.a.lengthOf(NUMBER_OF_PUBLIC_GUILDS);
  });

  describe('filters', () => {
    it('returns public guilds filtered by category', async () => {
      const guilds = await user.get(`/groups?type=publicGuilds&categories=${categories[0].slug}`);

      expect(guilds[0]._id).to.equal(publicGuildNotMember._id);
    });

    it('returns private guilds filtered by category', async () => {
      const guilds = await user.get(`/groups?type=privateGuilds&categories=${categories[0].slug}`);

      expect(guilds[0]._id).to.equal(privateGuildUserIsMemberOf._id);
    });

    it('filters public guilds by size', async () => {
      await generateGroup(user, {
        name: 'guild1',
        type: 'guild',
        privacy: 'public',
        memberCount: 1,
      });

      // @TODO: anyway to set higher memberCount in tests right now?

      const guilds = await user.get('/groups?type=publicGuilds&minMemberCount=3');

      expect(guilds.length).to.equal(0);
    });

    it('filters private guilds by size', async () => {
      await generateGroup(user, {
        name: 'guild1',
        type: 'guild',
        privacy: 'private',
        memberCount: 1,
      });

      // @TODO: anyway to set higher memberCount in tests right now?

      const guilds = await user.get('/groups?type=privateGuilds&minMemberCount=3');

      expect(guilds.length).to.equal(0);
    });

    it('filters public guilds by leader role', async () => {
      const guilds = await user.get('/groups?type=publicGuilds&leader=true');
      expect(guilds.length).to.equal(NUMBER_OF_PUBLIC_GUILDS_USER_IS_LEADER);
    });

    it('filters public guilds by member role', async () => {
      const guilds = await userInGuild.get('/groups?type=publicGuilds&member=true');
      expect(guilds.length).to.equal(1);
      expect(guilds[0].name).to.have.string('is member');
    });

    it('filters public guilds by single-word search term', async () => {
      const guilds = await user.get('/groups?type=publicGuilds&search=kom');
      expect(guilds.length).to.equal(1);
      expect(guilds[0].summary).to.have.string('ohayou kombonwa');
    });

    it('filters public guilds by single-word search term left and right-padded by spaces', async () => {
      const guilds = await user.get('/groups?type=publicGuilds&search=++++ohayou+kombonwa+++++');
      expect(guilds.length).to.equal(1);
      expect(guilds[0].summary).to.have.string('ohayou kombonwa');
    });

    it('filters public guilds by two-words search term separated by multiple spaces', async () => {
      const guilds = await user.get('/groups?type=publicGuilds&search=kinnosuke+++++hon');
      expect(guilds.length).to.equal(1);
      expect(guilds[0].description).to.have.string('Kinnosuke');
    });
  });

  describe('public guilds pagination', () => {
    it('req.query.paginate must be a boolean string', async () => {
      await expect(user.get('/groups?paginate=aString&type=publicGuilds'))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'Invalid request parameters.',
        });
    });

    it('req.query.paginate can only be true when req.query.type includes publicGuilds', async () => {
      await expect(user.get('/groups?paginate=true&type=notPublicGuilds'))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: apiError('guildsOnlyPaginate'),
        });
    });

    it('req.query.page can\'t be negative', async () => {
      await expect(user.get('/groups?paginate=true&page=-1&type=publicGuilds'))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'Invalid request parameters.',
        });
    });

    it('returns 30 guilds per page ordered by number of members', async () => {
      await user.update({ balance: 9000 });
      const groups = await Promise.all(_.times(60, i => generateGroup(user, {
        name: `public guild ${i} - is member`,
        type: 'guild',
        privacy: 'public',
      })));

      // update group number 32 and not the first to make sure sorting works
      await groups[32].update({ name: 'guild with most members', memberCount: 199 });
      await groups[33].update({ name: 'guild with less members', memberCount: -100 });

      const page0 = await expect(user.get('/groups?type=publicGuilds&paginate=true'))
        .to.eventually.have.a.lengthOf(GUILD_PER_PAGE);
      expect(page0[0].name).to.equal('guild with most members');

      await expect(user.get('/groups?type=publicGuilds&paginate=true&page=1'))
        .to.eventually.have.a.lengthOf(GUILD_PER_PAGE);
      const page2 = await expect(user.get('/groups?type=publicGuilds&paginate=true&page=2'))
        .to.eventually.have.a.lengthOf(1 + 4); // 1 created now, 4 by other tests
      expect(page2[4].name).to.equal('guild with less members');
    }).timeout(10000);
  });

  it('returns all the user\'s guilds when guilds passed in as query', async () => {
    await expect(user.get('/groups?type=guilds'))
      .to.eventually.have.a
      .lengthOf(NUMBER_OF_PUBLIC_GUILDS_USER_IS_MEMBER + NUMBER_OF_USERS_PRIVATE_GUILDS);
  });

  it('returns all private guilds user is a part of when privateGuilds passed in as query', async () => {
    await expect(user.get('/groups?type=privateGuilds'))
      .to.eventually.have.a.lengthOf(NUMBER_OF_USERS_PRIVATE_GUILDS);
  });

  it('returns a list of groups user has access to', async () => {
    await expect(user.get('/groups?type=privateGuilds,publicGuilds,party,tavern'))
      .to.eventually.have.lengthOf(NUMBER_OF_GROUPS_USER_CAN_VIEW);
  });

  it('returns a list of groups user has access to', async () => {
    const group = await generateGroup(user, {
      name: 'c++ coders',
      type: 'guild',
      privacy: 'public',
    });

    // search for 'c++ coders'
    await expect(user.get('/groups?type=publicGuilds&paginate=true&page=0&search=c%2B%2B+coders'))
      .to.eventually.have.lengthOf(1)
      .and.to.have.nested.property('[0]')
      .and.to.have.property('_id', group._id);
  });
});
