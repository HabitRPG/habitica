import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /group', () => {
  let user;
  let api;

  beforeEach(() => {
    return generateUser({balance: 4}).then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns an error when group is not found', () => {
    return expect(api.get('/groups/fakeGroupId', {}))
    .to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('returns a list of groups', () => {
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

    return api.post('/groups', {
      name: groups[0].name,
      type: groups[0].type,
    })
    .then(() => {
      return api.post('/groups', {
        name: groups[1].name,
        type: groups[1].type,
      });
    })
    .then(() => {
      return api.post('/groups', {
        name: groups[2].name,
        type: groups[2].type,
        privacy: groups[2].privacy,
      });
    })
    .then(() => {
      return api.get('/groups?type=party,privateGuilds,publicGuilds,tavern');
    })
    .then((groupsFound) => {
      expect(groupsFound.length).to.be.greaterThan(3);
    });
  });

  context('Guilds', () => {
    context('public guild', () => {
      it('returns a group', () => {
        let groupName = 'Test Public Guild';
        let groupType = 'guild';

        return api.post('/groups', {
          name: groupName,
          type: groupType,
        }).then((createdGroup) => {
          return api.get(`/groups/${createdGroup._id}`);
        })
        .then((groupFound) => {
          expect(groupFound._id).to.exist;
          expect(groupFound.name).to.equal(groupName);
          expect(groupFound.type).to.equal(groupType);
        });
      });
    });

    context('private guild', () => {
      it('returns a group', () => {
        let groupName = 'Test Private Guild';
        let groupType = 'guild';
        let groupPrivacy = 'private';

        return api.post('/groups', {
          name: groupName,
          type: groupType,
          privacy: groupPrivacy,
        }).then((createdGroup) => {
          return api.get(`/groups/${createdGroup._id}`);
        })
        .then((groupFound) => {
          expect(groupFound._id).to.exist;
          expect(groupFound.name).to.equal(groupName);
          expect(groupFound.type).to.equal(groupType);
        });
      });
    });
  });

  context('Parties', () => {
    it('returns a group', () => {
      let groupName = 'Test Party';
      let groupType = 'party';

      return api.post('/groups', {
        name: groupName,
        type: groupType,
      }).then((createdGroup) => {
        return api.get(`/groups/${createdGroup._id}`);
      })
      .then((groupFound) => {
        expect(groupFound._id).to.exist;
        expect(groupFound.name).to.equal(groupName);
        expect(groupFound.type).to.equal(groupType);
      });
    });
  });
});
