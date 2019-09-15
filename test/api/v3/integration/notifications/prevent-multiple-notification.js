import {
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

describe('Prevent multiple notifications', () => {
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

    for (let i = 0; i < 4; i++) {
      for (let memberIndex = 0; memberIndex < partyMembers.length; memberIndex++) {
        multipleChatMessages.push(
          partyMembers[memberIndex].post(`/groups/${party._id}/chat`, { message: `Message ${i}_${memberIndex}`}),
        );
      }
    }

    await Promise.all(multipleChatMessages);

    const userWithNotification = await partyLeader.get('/user');

    expect(userWithNotification.notifications.length).to.be.eq(1);
  });
});
