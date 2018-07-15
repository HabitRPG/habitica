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
    await partyMembers[0].post(`/groups/${party._id}/chat`, { message: 'Message 1'});
    await partyMembers[1].post(`/groups/${party._id}/chat`, { message: 'Message 2'});
    await partyMembers[2].post(`/groups/${party._id}/chat`, { message: 'Message 3'});
    await partyMembers[3].post(`/groups/${party._id}/chat`, { message: 'Message 4'});

    const userWithNotification = await partyLeader.get('/user');

    expect(userWithNotification.notifications.length).to.be.eq(1);
  });
});
