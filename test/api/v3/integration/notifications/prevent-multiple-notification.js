import {
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

describe.only('Prevent multiple notifications', () => {
  let partyLeader, partyMembers, party;

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        type: 'party',
        privacy: 'private',
      },
      members: 4,
    });

    party = group;
    partyLeader = groupLeader;
    partyMembers = members;
  });

  it('does not add the same notification twice', async () => {
    const multipleChatMessages = [];

    multipleChatMessages.push(
      partyMembers[0].post(`/groups/${party._id}/chat`, { message: 'Message 1'}),
      partyMembers[1].post(`/groups/${party._id}/chat`, { message: 'Message 2'}),
      partyMembers[2].post(`/groups/${party._id}/chat`, { message: 'Message 3'}),
      partyMembers[3].post(`/groups/${party._id}/chat`, { message: 'Message 4'})
    );

    await Promise.all(multipleChatMessages);

    const userWithNotification = await partyLeader.get('/user');

    expect(userWithNotification.notifications.length).to.be.eq(1);
  });
});
