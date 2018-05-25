import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('DELETE user message', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({ inbox: { messages: { first: 'message', second: 'message' } } });
    expect(user.inbox.messages.first).to.eql('message');
    expect(user.inbox.messages.second).to.eql('message');
  });

  it('one message', async () => {
    let result = await user.del('/user/messages/first');
    await user.sync();
    expect(result).to.eql({ second: 'message' });
    expect(user.inbox.messages).to.eql({ second: 'message' });
  });

  it('clear all', async () => {
    let result = await user.del('/user/messages');
    await user.sync();
    expect(user.inbox.messages).to.eql({});
    expect(result).to.eql({});
  });
});
