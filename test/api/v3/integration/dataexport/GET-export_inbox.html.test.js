import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /export/inbox.html', () => {
  let user;

  before(async () => {
    const otherUser = await generateUser({
      'profile.name': 'Other User',
    });
    user = await generateUser({
      'profile.name': 'Main User',
    });

    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: ':smile: hi',
    });
    await user.post('/members/send-private-message', {
      toUserId: otherUser.id,
      message: '# Hello!',
    });
    await otherUser.post('/members/send-private-message', {
      toUserId: user.id,
      message: '* list 1\n* list 2\n * list 3 \n * [list with a link](http://example.com)',
    });

    await user.sync();
  });

  it('returns an html page', async () => {
    const res = await user.get('/export/inbox.html');

    expect(res.substring(0, 100).indexOf('<!DOCTYPE html>')).to.equal(0);
  });

  it('renders the markdown messages as html', async () => {
    const res = await user.get('/export/inbox.html');

    expect(res).to.include('img class="habitica-emoji"');
    expect(res).to.include('<h1>Hello!</h1>');
    expect(res).to.include('<li>list 1</li>');
  });

  it('sorts messages from newest to oldest', async () => {
    const res = await user.get('/export/inbox.html');

    const emojiPosition = res.indexOf('img class="habitica-emoji"');
    const headingPosition = res.indexOf('<h1>Hello!</h1>');
    const listPosition = res.indexOf('<li>list 1</li>');

    expect(emojiPosition).to.be.greaterThan(headingPosition);
    expect(headingPosition).to.be.greaterThan(listPosition);
    expect(listPosition).to.be.greaterThan(-1); // make sure it exists at all
  });
});
