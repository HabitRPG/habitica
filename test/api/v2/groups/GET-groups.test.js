import {
  generateGroup,
  generateUser,
  resetHabiticaDB,
} from '../../../helpers/api-integration/v2';
import {
  TAVERN_ID,
} from '../../../../website/server/models/group';

describe('GET /groups', () => {
  const NUMBER_OF_PUBLIC_GUILDS = 3;

  let user;
  let leader;

  before(async () => {
    // Set up a world with a mixture of public and private guilds
    // Invite user to a few of them
    await resetHabiticaDB();

    user = await generateUser();
    leader = await generateUser({ balance: 10 });

    await generateGroup(leader, {
      name: 'public guild - is member',
      type: 'guild',
      privacy: 'public',
    }, {
      members: [leader._id, user._id],
    });

    await generateGroup(leader, {
      name: 'public guild - is not member',
      type: 'guild',
      privacy: 'public',
    });

    await generateGroup(leader, {
      name: 'private guild - is member',
      type: 'guild',
      privacy: 'private',
    }, {
      members: [leader._id, user._id],
    });

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

  context('no query passed in', () => {
    xit('lists all public guilds, the tavern, user\'s party, and any private guilds that user is a part of - TODO query includes duplicates - IE, tavern is included as tavern and part of public guilds. Refactor so this is not the case');
  });

  context('tavern passed in as query', () => {
    it('returns only the tavern', async () => {
      await expect(user.get('/groups', null, {type: 'tavern'}))
        .to.eventually.have.a.lengthOf(1)
        .and.to.have.deep.property('[0]')
        .and.to.have.property('_id', TAVERN_ID);
    });
  });

  context('party passed in as query', () => {
    it('returns only the user\'s party', async () => {
      await expect(user.get('/groups', null, {type: 'party'}))
        .to.eventually.have.a.lengthOf(1)
        .and.to.have.deep.property('[0]')
        .and.to.have.property('leader', user._id);
    });
  });

  context('public passed in as query', () => {
    it('returns all public guilds', async () => {
      await expect(user.get('/groups', null, {type: 'public'}))
        .to.eventually.have.a.lengthOf(NUMBER_OF_PUBLIC_GUILDS);
    });
  });

  context('guilds passed in as query', () => {
    it('returns all guilds user is a part of ', async () => {
      await expect(leader.get('/groups', null, {type: 'guilds'}))
        .to.eventually.have.a.lengthOf(4);
    });
  });
});
