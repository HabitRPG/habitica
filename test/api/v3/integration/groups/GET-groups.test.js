import {
  generateUser,
} from '../../../../helpers/api-integration.helper';
import Q from 'q';

describe('GET /groups', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({balance: 4});
  });

  it('returns a list of groups', async () => {
    let groups = [
      {
        name: 'Test Party',
        type: 'party',
      },
      {
        name: 'Test Public Guild',
        type: 'guild',
        privacy: 'public',
      },
      {
        name: 'Test Private Guild',
        type: 'guild',
      },
    ];

    await Q.all(groups.map(group => user.post('/groups', { name: group.name, type: group.type, privacy: group.privacy })));

    let groupsFound = await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
    expect(groupsFound.length).to.be.greaterThan(3);
  });
});
