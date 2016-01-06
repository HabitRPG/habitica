import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /groups/:id', () => {
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
