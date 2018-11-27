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
        }, { auth: { local: { username: 'user-dash' } }, _id: '444',
        }, { auth: { local: { username: 'user_underscore' } }, _id: '555',
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
    expect(highlightedText).to.equal('[@user](/profile/111): message');
  });
  it('highlights special characters', async () => {
    let text = '@user-dash: message @user_underscore';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('[@user-dash](/profile/444): message [@user_underscore](/profile/555)');
  });
  it('doesn\'t highlight nonexisting users', async () => {
    let text = '@nouser message';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('@nouser message');
  });
  it('highlights multiple existing users', async () => {
    let text = '@user message (@user2) @user3 @user';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal('[@user](/profile/111) message ([@user2](/profile/222)) [@user3](/profile/333) [@user](/profile/111)');
  });
  it('doesn\'t highlight more than 5 users', async () => {
    let text = '@user @user2 @user3 @user4 @user5 @user6';
    let highlightedText = await highlightMentions(text);
    expect(highlightedText).to.equal(text);
  });
});
