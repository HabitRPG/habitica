import {
  generateUser,
} from '../../../helpers/api-integration/v2';

describe('POST /members/id/message', () => {
  let sender, recipient;

  beforeEach(async () => {
    sender = await generateUser();
    recipient = await generateUser();
  });

  it('adds the sent message to sender\'s inbox', async () => {
    expect(sender.inbox.messages).to.be.empty;

    await sender.post(`/members/${recipient._id}/message`, {
      message: 'hello frodo',
    });

    await sender.sync();

    expect(sender.inbox.messages).to.not.be.empty;

    let messageKey = Object.keys(sender.inbox.messages)[0];
    let message = sender.inbox.messages[messageKey];

    expect(message.text).to.eql('hello frodo');
  });

  it('adds a message to recipients\'s inbox', async () => {
    expect(recipient.inbox.messages).to.be.empty;

    await sender.post(`/members/${recipient._id}/message`, {
      message: 'hello frodo',
    });

    await recipient.sync();

    expect(recipient.inbox.messages).to.not.be.empty;

    let messageKey = Object.keys(recipient.inbox.messages)[0];
    let message = recipient.inbox.messages[messageKey];

    expect(message.text).to.eql('hello frodo');
  });

  it('does not increment the sender\'s new messages field', async () => {
    expect(sender.inbox.messages).to.be.empty;

    await sender.post(`/members/${recipient._id}/message`, {
      message: 'hello frodo',
    });

    await sender.sync();

    expect(sender.inbox.newMessages).to.eql(0);
  });

  it('increments the recipient\'s new messages field', async () => {
    expect(recipient.inbox.messages).to.be.empty;

    await sender.post(`/members/${recipient._id}/message`, {
      message: 'hello frodo',
    });

    await recipient.sync();

    expect(recipient.inbox.newMessages).to.eql(1);
  });
});
