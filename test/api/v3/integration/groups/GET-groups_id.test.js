import { v4 as generateUUID } from 'uuid';

import {
  each,
} from 'lodash';
import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /groups/:id', () => {
  const typesOfGroups = {};
  typesOfGroups['private guild'] = { type: 'guild', privacy: 'private' };
  typesOfGroups.party = { type: 'party', privacy: 'private' };

  each(typesOfGroups, (groupDetails, groupType) => {
    context(`Member of a ${groupType}`, () => {
      let leader; let member; let
        createdGroup;

      before(async () => {
        const groupData = await createAndPopulateGroup({
          members: 30,
          groupDetails,
          upgradeToGroupPlan: groupDetails.type === 'guild',
        });

        leader = groupData.groupLeader;
        [member] = groupData.members;
        createdGroup = groupData.group;
      });

      it('returns the group object', async () => {
        const group = await member.get(`/groups/${createdGroup._id}`);

        expect(group._id).to.eql(createdGroup._id);
        expect(group.name).to.eql(createdGroup.name);
        expect(group.type).to.eql(createdGroup.type);
        expect(group.privacy).to.eql(createdGroup.privacy);
      });

      it('transforms leader id to leader object', async () => {
        const group = await member.get(`/groups/${createdGroup._id}`);

        expect(group.leader._id).to.eql(leader._id);
        expect(group.leader.profile.name).to.eql(leader.profile.name);
      });
    });
  });

  context('Non-member of a private guild', () => {
    let nonMember; let
      createdGroup;

    before(async () => {
      const groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
        },
        upgradeToGroupPlan: true,
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
    let nonMember; let
      createdGroup;

    before(async () => {
      const groupData = await createAndPopulateGroup({
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
    let member; let
      createdGroup;

    before(async () => {
      const groupData = await createAndPopulateGroup({
        members: 1,
        groupDetails: {
          name: 'test party',
          type: 'party',
          privacy: 'private',
        },
      });

      createdGroup = groupData.group;
      member = groupData.members[0]; // eslint-disable-line prefer-destructuring
    });

    it('returns the user\'s party if an id of "party" is passed in', async () => {
      const group = await member.get('/groups/party');

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

    it('removes non-existent guild from user\'s guild list', async () => {
      const guildId = generateUUID();

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

    it('removes non-existent party from user\'s party object', async () => {
      const partyId = generateUUID();

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
    let group; let members;

    const chat1 = {
      id: 'chat1',
      text: 'chat 1',
      flags: {},
    };

    const chat2 = {
      id: 'chat2',
      text: 'chat 2',
      flags: {},
      flagCount: 0,
    };

    const chat3 = {
      id: 'chat3',
      text: 'chat 3',
      flags: {
        'user-id': true,
      },
      flagCount: 1,
    };

    const chat4 = {
      id: 'chat4',
      text: 'chat 4',
      flags: {
        'user-id': true,
        'other-user-id': true,
      },
      flagCount: 2,
    };

    const chat5 = {
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
      const groupData = await createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'private',
          chat: [
            chat1,
            chat2,
            chat3,
            chat4,
            chat5,
          ],
        },
        members: 1,
        upgradeToGroupPlan: true,
      });

      ({ group, members } = groupData);

      await group.addChat([chat1, chat2, chat3, chat4, chat5]);
    });

    context('non-admin', () => {
      let nonAdmin;

      beforeEach(() => {
        [nonAdmin] = members;
      });

      it('does not include messages with a flag count of 2 or greater', async () => {
        const fetchedGroup = await nonAdmin.get(`/groups/${group._id}`);

        expect(fetchedGroup.chat).to.have.lengthOf(3);
        expect(fetchedGroup.chat[0].id).to.eql(chat1.id);
        expect(fetchedGroup.chat[1].id).to.eql(chat2.id);
        expect(fetchedGroup.chat[2].id).to.eql(chat3.id);
      });

      it('does not include user ids in flags object', async () => {
        const fetchedGroup = await nonAdmin.get(`/groups/${group._id}`);
        const chatWithOneFlag = fetchedGroup.chat[2];

        expect(chatWithOneFlag.id).to.eql(chat3.id);
        expect(chat3.flags).to.eql({ 'user-id': true });
        expect(chatWithOneFlag.flags).to.eql({});
      });
    });

    context('admin', () => {
      let admin;

      beforeEach(async () => {
        [admin] = members;
        await admin.update({ permissions: { moderator: true } });
      });

      it('includes all messages', async () => {
        const fetchedGroup = await admin.get(`/groups/${group._id}`);

        expect(fetchedGroup.chat).to.have.lengthOf(5);
        expect(fetchedGroup.chat[0].id).to.eql(chat1.id);
        expect(fetchedGroup.chat[1].id).to.eql(chat2.id);
        expect(fetchedGroup.chat[2].id).to.eql(chat3.id);
        expect(fetchedGroup.chat[3].id).to.eql(chat4.id);
        expect(fetchedGroup.chat[4].id).to.eql(chat5.id);
      });

      it('includes user ids in flags object', async () => {
        const fetchedGroup = await admin.get(`/groups/${group._id}`);
        const chatWithOneFlag = fetchedGroup.chat[2];

        expect(chatWithOneFlag.id).to.eql(chat3.id);
        expect(chat3.flags).to.eql({ 'user-id': true });
        expect(chatWithOneFlag.flags).to.eql(chat3.flags);
      });
    });
  });
});
