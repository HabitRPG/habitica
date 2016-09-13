import clearInviteAcceptedNotification from '../../../common/script/ops/clearInviteAcceptedNotification';
import {
  generateUser,
} from '../../helpers/common.helper';
import { v4 as generateUUID } from 'uuid';

describe('shared.ops.clearInviteAcceptedNotification', () => {
  let user;
  let groupId = generateUUID();
  let acceptedInvitationNotification = {id: groupId, groupName: 'group', invitedUsername: 'test', type: 'party'};

  beforeEach(() => {
    user = generateUser();
    user.invitations.accepted = [acceptedInvitationNotification];
  });

  it('removes accepted invitation notification', () => {
    expect(user.invitations.accepted.length).to.eql(1);
    let result = clearInviteAcceptedNotification(user, {params: acceptedInvitationNotification});
    expect(user.invitations.accepted.length).to.eql(0);
    expect(result).to.eql([]);
  });
});
