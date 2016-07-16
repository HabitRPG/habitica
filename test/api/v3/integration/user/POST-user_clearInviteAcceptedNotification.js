import {
  generateUser,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /user/clerInviteAcceptedNotification', () => {
  let user;
  let groupId = generateUUID();
  let acceptedInvitationNotification = {id: groupId, groupName: 'group', invitedUsername: 'test', type: 'party'};

  beforeEach(async () => {
    user = await generateUser({'invitations.accepted': [acceptedInvitationNotification]});
  });

  it('removes accepted notification from user', async () => {
    expect(user.invitations.accepted.length).to.eql(1);
    let response = await user.post(`/user/clearInviteAcceptedNotification/test/${groupId}`);
    await user.sync();

    expect(user.invitations.accepted.length).to.eql(0);
    expect(response).to.eql(user.invitations.accepted);
  });
});
