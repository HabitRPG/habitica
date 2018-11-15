import {
  highlightMentions,
} from '../../../../website/server/libs/highlightMentions';
import mongoose from 'mongoose';

describe.only('highlightMentions', () => {
  beforeEach(() => {
    const mockFind = {
      select () {
        return this;
      },
      lean () {
        return this;
      },
      exec () {
        return Promise.resolve([{
          auth: { local: { username: 'user' } }, _id: '111',
        }, { auth: { local: { username: 'user2' } }, _id: '222',
        }, { auth: { local: { username: 'user3' } }, _id: '333',
        },
        ]);
      },
    };

    sinon.stub(mongoose.Model, 'find').returns(mockFind);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('doesn\'t change text without mentions', async () => {
    let text = 'some chat text';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal(text);
  });
  it('highlights existing users', async () => {
    let text = '@user: message';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('[@user](https://habitica.com/members/111): message');
  });
  it('doesn\'t highlight nonexisting users', async () => {
    let text = '@nouser message';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('@nouser message');
  });
  it('highlights multiple existing users', async () => {
    let text = '@user message (@user2) @user3 @user';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('[@user](https://habitica.com/members/111) message ([@user2](https://habitica.com/members/222)) [@user3](https://habitica.com/members/333) [@user](https://habitica.com/members/111)');
  });
  it('doesn\'t highlight more than 5 users', async () => {
    let text = '@user @user2 @user3 @user4 @user5 @user6';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal(text);
  });
});
