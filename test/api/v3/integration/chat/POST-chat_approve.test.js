import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import config from '../../../../../website/server/libs/config';

describe('POST /chat/:chatId/approve', () => {
  const testMessage = 'test-message';
  let user;
  let groupWithChat;
  let memberChatApproval;
  let configStub;
  let message;

  before(async () => {
    configStub = sinon.stub(config, 'isChatApprovalRequired').returns(true);

    user = await generateUser();

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

    const result = await memberChatApproval.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
    message = result.message;
  });

  after(() => {
    configStub.restore();
  });

  it('errors when user is not an admin', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat/${message.id}/approve`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('noAdminAccess'),
      });
  });

  it('approves a chat', async () => {
    user = await generateUser({contributor: {admin: true}});

    const messageResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.id}/approve`);

    expect(messageResult.approvalRequired).to.eql(false);
  });
});
