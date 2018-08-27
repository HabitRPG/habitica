import moment from 'moment';

import {
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';
import config from '../../../../../website/server/libs/config';

describe('POST /chat - Chat Approval', () => {
  const testMessage = 'test-message';
  let groupWithChat;
  let memberChatApproval;
  let configStub;

  before(async () => {
    configStub = sinon.stub(config, 'isChatApprovalRequired').returns(true);

    const { group, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Public Guild',
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    groupWithChat = group;
    memberChatApproval = members[0];
  });

  after(() => {
    configStub.restore();
  });

  it('adds approval requirements to new users when env var is on', async () => {
    const message = await memberChatApproval.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
    expect(message.message.approvalRequired).to.eql(true);
  });

  it('does not add approval requirements to old users when env var is on', async () => {
    const twoDaysAgo = moment().startOf('day').subtract(2, 'days').toDate();
    await memberChatApproval.update({'auth.timestamps.created': twoDaysAgo});

    const message = await memberChatApproval.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
    expect(message.message.approvalRequired).to.eql(false);
  });
});
