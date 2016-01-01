import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /group', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({balance: 4});
  });

  it('returns an error when group is not found', async () => {
    await expect(user.get('/groups/fakeGroupId', {}))
    .to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
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

  context('Guilds', () => {
    context('public guild', () => {
      it('returns a group', async  () => {
        let groupName = 'Test Public Guild';
        let groupType = 'guild';
        let createdGroup = await  user.post('/groups', {
          name: groupName,
          type: groupType,
        });
        let groupFound = await user.get(`/groups/${createdGroup._id}`);

        expect(groupFound._id).to.exist;
        expect(groupFound.name).to.equal(groupName);
        expect(groupFound.type).to.equal(groupType);
      });
    });

    context('private guild', () => {
      it('returns a group', async () => {
        let groupName = 'Test Private Guild';
        let groupType = 'guild';
        let groupPrivacy = 'private';
        let createdGroup = await user.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        });
        let groupFound = await user.get(`/groups/${createdGroup._id}`);

        expect(groupFound._id).to.exist;
        expect(groupFound.name).to.equal(groupName);
        expect(groupFound.type).to.equal(groupType);
      });
    });
  });

  context('Parties', () => {
    it('returns a group', async () => {
      let groupName = 'Test Party';
      let groupType = 'party';
      let createdGroup = await user.post('/groups', {
        name: groupName,
        type: groupType,
      });
      let groupFound = await user.get(`/groups/${createdGroup._id}`);

      expect(groupFound._id).to.exist;
      expect(groupFound.name).to.equal(groupName);
      expect(groupFound.type).to.equal(groupType);
    });
  });
});
