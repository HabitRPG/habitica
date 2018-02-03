import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

import {
  each,
} from 'lodash';

describe('GET /groups/:id', () => {
  let typesOfGroups = {};
  typesOfGroups['public guild'] = { type: 'guild', privacy: 'public' };
  typesOfGroups['private guild'] = { type: 'guild', privacy: 'private' };
  typesOfGroups.party = { type: 'party', privacy: 'private' };

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Member of a ${groupType}`, () => {
      let leader, member, createdGroup;

      before(async () => {
        let groupData = await createAndPopulateGroup({
          members: 30,
          groupDetails,
        });

        leader = groupData.groupLeader;
        member = groupData.members[0];
        createdGroup = groupData.group;
      });

      it('returns the group object', async () => {
        let group = await member.get(`/groups/${createdGroup._id}`);

        expect(group._id).to.eql(createdGroup._id);
        expect(group.name).to.eql(createdGroup.name);
        expect(group.type).to.eql(createdGroup.type);
        expect(group.privacy).to.eql(createdGroup.privacy);
      });

      it('transforms leader id to leader object', async () => {
        let group = await member.get(`/groups/${createdGroup._id}`);

        expect(group.leader._id).to.eql(leader._id);
        expect(group.leader.profile.name).to.eql(leader.profile.name);
      });
    });
  });

  context('Non-member of a public guild', () => {
    let nonMember, createdGroup;

    before(async () => {
      let groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      });

      createdGroup = groupData.group;
      nonMember =  await generateUser();
    });

    it('returns the group object for a non-member', async () => {
      let group = await nonMember.get(`/groups/${createdGroup._id}`);

      expect(group._id).to.eql(createdGroup._id);
      expect(group.name).to.eql(createdGroup.name);
      expect(group.type).to.eql(createdGroup.type);
      expect(group.privacy).to.eql(createdGroup.privacy);
    });
  });

  context('Non-member of a private guild', () => {
    let nonMember, createdGroup;

    before(async () => {
      let groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
      });

      createdGroup = groupData.group;
      nonMember = await generateUser();
    });

    it('does not return the group object for a non-member', async () => {
      await expect(nonMember.get(`/groups/${createdGroup._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });
  });

  context('Non-member of a party', () => {
    let nonMember, createdGroup;

    before(async () => {
      let groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      });

      createdGroup = groupData.group;
      nonMember = await generateUser();
    });

    it('does not return the group object for a non-member', async () => {
      await expect(nonMember.get(`/groups/${createdGroup._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });
  });

  context('Member of a party', () => {
    let member, createdGroup;

    before(async () => {
      let groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      });

      createdGroup = groupData.group;
      member = groupData.members[0];
    });

    it('returns the user\'s party if an id of "party" is passed in', async () => {
      let group = await member.get('/groups/party');

      expect(group._id).to.eql(createdGroup._id);
      expect(group.name).to.eql(createdGroup.name);
      expect(group.type).to.eql(createdGroup.type);
      expect(group.privacy).to.eql(createdGroup.privacy);
    });
  });

  context('Non-existent group', () => {
    let user;

    beforeEach(async () => {
      user = await generateUser();
    });

    it('returns error if group does not exist', async () => {
      await expect(user.get('/groups/group-that-does-not-exist'))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('removes non-existant guild from user\'s guild list', async () => {
      let guildId = generateUUID();

      await user.update({
        guilds: [guildId, generateUUID()],
      });

      await expect(user.get(`/groups/${guildId}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });

      await user.sync();

      expect(user.guilds).to.have.a.lengthOf(1);
      expect(user.guilds).to.not.include(guildId);
    });

    it('removes non-existant party from user\'s party object', async () => {
      let partyId = generateUUID();

      await user.update({
        party: { _id: partyId },
      });

      await expect(user.get(`/groups/${partyId}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });

      await user.sync();

      expect(user.party).to.eql({});
    });
  });

  context('Flagged messages', () => {
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

    beforeEach(async () => {
      let groupData = await createAndPopulateGroup({
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
      });

      group = groupData.group;

      await group.addChat([chat1, chat2, chat3, chat4, chat5]);
    });

    context('non-admin', () => {
      let nonAdmin;

      beforeEach(async () => {
        nonAdmin = await generateUser();
      });

      it('does not include messages with a flag count of 2 or greater', async () => {
        let fetchedGroup = await nonAdmin.get(`/groups/${group._id}`);

        expect(fetchedGroup.chat).to.have.lengthOf(3);
        expect(fetchedGroup.chat[0].id).to.eql(chat1.id);
        expect(fetchedGroup.chat[1].id).to.eql(chat2.id);
        expect(fetchedGroup.chat[2].id).to.eql(chat3.id);
      });

      it('does not include user ids in flags object', async () => {
        let fetchedGroup = await nonAdmin.get(`/groups/${group._id}`);
        let chatWithOneFlag = fetchedGroup.chat[2];

        expect(chatWithOneFlag.id).to.eql(chat3.id);
        expect(chat3.flags).to.eql({ 'user-id': true });
        expect(chatWithOneFlag.flags).to.eql({});
      });
    });

    context('admin', () => {
      let admin;

      beforeEach(async () => {
        admin = await generateUser({
          'contributor.admin': true,
        });
      });

      it('includes all messages', async () => {
        let fetchedGroup = await admin.get(`/groups/${group._id}`);

        expect(fetchedGroup.chat).to.have.lengthOf(5);
        expect(fetchedGroup.chat[0].id).to.eql(chat1.id);
        expect(fetchedGroup.chat[1].id).to.eql(chat2.id);
        expect(fetchedGroup.chat[2].id).to.eql(chat3.id);
        expect(fetchedGroup.chat[3].id).to.eql(chat4.id);
        expect(fetchedGroup.chat[4].id).to.eql(chat5.id);
      });

      it('includes user ids in flags object', async () => {
        let fetchedGroup = await admin.get(`/groups/${group._id}`);
        let chatWithOneFlag = fetchedGroup.chat[2];

        expect(chatWithOneFlag.id).to.eql(chat3.id);
        expect(chat3.flags).to.eql({ 'user-id': true });
        expect(chatWithOneFlag.flags).to.eql(chat3.flags);
      });
    });
  });
});
