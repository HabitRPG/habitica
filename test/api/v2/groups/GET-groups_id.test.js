import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';
import {
  find,
  each
} from 'lodash';

describe('GET /groups/:id', () => {

  let typesOfGroups = {};
  typesOfGroups['public guild'] = { type: 'guild', privacy: 'public' };
  typesOfGroups['private guild'] = { type: 'guild', privacy: 'private' };
  typesOfGroups['party'] = { type: 'party', privacy: 'private' };

  each(typesOfGroups, (groupData, groupType) => {
    context(`Member of a ${groupType}`, () => {
      let leader, member, createdGroup;

      before(() => {
        return createAndPopulateGroup({
          members: 30,
          groupDetails: {
            name: 'test guild',
            type: 'guild',
            privacy: 'public',
          },
        }).then((res) => {
          leader = res.leader;
          member = res.members[0];
          createdGroup = res.group;
        });
      });

      it('returns the group object', () => {
        let api = requester(member);
        return api.get(`/groups/${createdGroup._id}`).then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
        });
      });

      it('transforms members array to an array of user objects', () => {
        let api = requester(member);
        return api.get(`/groups/${createdGroup._id}`).then((group) => {
          let member = group.members[0];
          expect(member._id).to.exist;
          expect(member.profile.name).to.exist;
          expect(member.contributor).to.exist;
          expect(member.achievements).to.exist;
          expect(member.items).to.exist;
        });
      });

      it('transforms leader id to leader object', () => {
        let api = requester(member);
        return api.get(`/groups/${createdGroup._id}`).then((group) => {
          expect(group.leader._id).to.eql(leader._id);
          expect(group.leader.profile.name).to.eql(leader.profile.name);
          expect(group.leader.items).to.exist;
          expect(group.leader.stats).to.exist;
          expect(group.leader.achievements).to.exist;
          expect(group.leader.contributor).to.exist;
        });
      });

      it('includes the user in the members list', () => {
        let api = requester(member);
        return api.get(`/groups/${createdGroup._id}`).then((group) => {
          let members = group.members;
          let userInGroup = find(members, (user) => {
            return member._id === user._id;
          });
          expect(userInGroup).to.be.ok;
        });
      });
    });
  });

  context('flagged messages', () => {
    let group;

    let chat1 = {
      id: 'chat1',
      text: 'chat 1',
      flags: {},
    };

    let chat2 = {
      id: 'chat2',
      text: 'chat 2',
      flags: {},
      flagCount: 0,
    };

    let chat3 = {
      id: 'chat3',
      text: 'chat 3',
      flags: {
        'user-id': true,
      },
      flagCount: 1,
    };

    let chat4 = {
      id: 'chat4',
      text: 'chat 4',
      flags: {
        'user-id': true,
        'other-user-id': true,
      },
      flagCount: 2,
    };

    let chat5 = {
      id: 'chat5',
      text: 'chat 5',
      flags: {
        'user-id': true,
        'other-user-id': true,
        'yet-another-user-id': true,
      },
      flagCount: 3,
    };

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
          chat: [
            chat1,
            chat2,
            chat3,
            chat4,
            chat5,
          ],
        },
      }).then((res) => {
        group = res.group;
      });
    });

    context('non-admin', () => {
      let api;

      beforeEach(() => {
        return generateUser().then((user) => {
          api = requester(user);
        });
      });

      it('does not include messages with a flag count of 2 or greater', () => {
        return api.get(`/groups/${group._id}`).then((_group) => {
          expect(_group.chat).to.have.lengthOf(3);
          expect(_group.chat[0].id).to.eql(chat1.id);
          expect(_group.chat[1].id).to.eql(chat2.id);
          expect(_group.chat[2].id).to.eql(chat3.id);
        });
      });

      it('does not include user ids in flags object', () => {
        return api.get(`/groups/${group._id}`).then((_group) => {
          let chatWithOneFlag = _group.chat[2];
          expect(chatWithOneFlag.id).to.eql(chat3.id);
          expect(chat3.flags).to.eql({ 'user-id': true });
          expect(chatWithOneFlag.flags).to.eql({});
        });
      });
    });

    context('admin', () => {
      let api;

      beforeEach(() => {
        return generateUser({
          'contributor.admin': true,
        }).then((user) => {
          api = requester(user);
        });
      });

      it('includes all messages', () => {
        return api.get(`/groups/${group._id}`).then((_group) => {
          expect(_group.chat).to.have.lengthOf(5);
          expect(_group.chat[0].id).to.eql(chat1.id);
          expect(_group.chat[1].id).to.eql(chat2.id);
          expect(_group.chat[2].id).to.eql(chat3.id);
          expect(_group.chat[3].id).to.eql(chat4.id);
          expect(_group.chat[4].id).to.eql(chat5.id);
        });
      });

      it('includes user ids in flags object', () => {
        return api.get(`/groups/${group._id}`).then((_group) => {
          let chatWithOneFlag = _group.chat[2];
          expect(chatWithOneFlag.id).to.eql(chat3.id);
          expect(chat3.flags).to.eql({ 'user-id': true });
          expect(chatWithOneFlag.flags).to.eql(chat3.flags);
        });
      });
    });
  });

  context('Non-member of a public guild', () => {
    let leader, nonMember, createdGroup;

    before(() => {
      return createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
      });
    });

    it('returns the group object for a non-member', () => {
      let api = requester(nonMember);
      return api.get(`/groups/${createdGroup._id}`)
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
        });
    });

    it('does not include user in members list', () => {
      let api = requester(nonMember);
      return api.get(`/groups/${createdGroup._id}`).then((group) => {
        let userInGroup = find(group.members, (user) => {
          return nonMember._id === user._id;
        });
        expect(userInGroup).to.not.be.ok;
      });
    });
  });

  context('Private Guilds', () => {
    let leader, nonMember, createdGroup;

    before(() => {
      return createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
      });
    });

    it('does not return the group object for a non-member', () => {
      let api = requester(nonMember);
      return expect(api.get(`/groups/${createdGroup._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupNotFound'),
        });
    });
  });

  context('Non-member of a party', () => {
    let leader, nonMember, createdGroup;

    before(() => {
      return createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        return generateUser();
      }).then((user) => {
        nonMember = user;
      });
    });

    it('does not return the group object for a non-member', () => {
      let api = requester(nonMember);
      return expect(api.get(`/groups/${createdGroup._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupNotFound'),
        });
    });
  });

  context('Member of a party', () => {
    let leader, member, createdGroup;

    before(() => {
      return createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      }).then((res) => {
        leader = res.leader;
        createdGroup = res.group;
        member = res.members[0];
      });
    });

    it('returns the user\'s party if an id of "party" is passed in', () => {
      let api = requester(member);
      return api.get('/groups/party')
        .then((group) => {
          expect(group._id).to.eql(createdGroup._id);
          expect(group.name).to.eql(createdGroup.name);
          expect(group.type).to.eql(createdGroup.type);
          expect(group.privacy).to.eql(createdGroup.privacy);
        });
    });
  });

  context('Non-existent group', () => {
    let user;

    beforeEach(() => {
      return generateUser().then((_user) => {
        user = _user;
      });
    });

    it('returns error if group does not exist', () => {
      let api = requester(user);
      return expect(api.get('/groups/group-that-does-not-exist'))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupNotFound'),
        });
    });
  });
});
