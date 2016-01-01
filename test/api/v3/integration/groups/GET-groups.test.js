import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

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
      },
      {
        name: 'Test Private Guild',
        type: 'guild',
        privacy: 'private',
      },
    ];

    let group1 = await user.post('/groups', {
      name: groups[0].name,
      type: groups[0].type,
    });

    let group2 = await user.post('/groups', {
      name: groups[1].name,
      type: groups[1].type,
    });

    let group3 = await user.post('/groups', {
      name: groups[2].name,
      type: groups[2].type,
    });

    expect(group1).toExist;
    expect(group2).toExist;
    expect(group3).toExist;

    let groupsFound = await user.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
    expect(groupsFound.length).to.be.greaterThan(3);
  });
});
