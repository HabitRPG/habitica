import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v4';

describe('DELETE /inbox/messages/:messageId', () => {
  let user;
  let otherUser;

  before(async () => {
    [user, otherUser] = await Promise.all([generateUser(), generateUser()]);

    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'first',
    });
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: 'second',
    });
    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: 'third',
    });
  });

  it('returns an error if the messageId parameter is not an UUID', async () => {
    await expect(user.del('/inbox/messages/123'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error if the message does not exist', async () => {
    await expect(user.del(`/inbox/messages/${generateUUID()}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('deletes one message', async () => {
    const messages = await user.get('/inbox/paged-messages');

    expect(messages.length).to.equal(3);

    expect(messages[0].text).to.equal('third');
    expect(messages[1].text).to.equal('second');
    expect(messages[2].text).to.equal('first');

    await user.del(`/inbox/messages/${messages[1]._id}`);
    const updatedMessages = await user.get('/inbox/paged-messages');
    expect(updatedMessages.length).to.equal(2);

    expect(updatedMessages[0].text).to.equal('third');
    expect(updatedMessages[1].text).to.equal('first');
  });
});
