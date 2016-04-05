import {
  generateGroup,
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v2';

describe('POST /groups/:id', () => {
  context('user is not the leader of the group', () => {
    let user, otherUser, groupUserDoesNotOwn;

    beforeEach(async () => {
      return Promise.all([
        generateUser({ balance: 10 }),
        generateUser({ balance: 10 }),
      ]).then((users) => {
        user = users[0];
        otherUser = users[1];

        return generateGroup(otherUser, {
          name: 'Group not Owned By User',
          type: 'guild',
          privacy: 'public',
          members: [user, otherUser],
        });
      }).then((group) => {
        groupUserDoesNotOwn = group;
      });
    });

    it('does not allow user to update group', async () => {
      return expect(user.post(`/groups/${groupUserDoesNotOwn._id}`, {
        name: 'Change',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageGroupOnlyLeaderCanUpdate'),
      });
    });
  });

  context('user is the leader of the group', () => {
    let user, usersGroup;

    beforeEach(async () => {
      user = await generateUser({
        balance: 10,
      });

      usersGroup = await generateGroup(user, {
        name: 'Original Group Title',
        type: 'guild',
        privacy: 'public',
      });
    });

    it('allows user to update group', async () => {
      await user.post(`/groups/${usersGroup._id}`, {
        name: 'New Group Title',
        description: 'New group description',
      });

      await usersGroup.sync();

      expect(usersGroup.name).to.eql('New Group Title');
      expect(usersGroup.description).to.eql('New group description');
    });
  });
});
