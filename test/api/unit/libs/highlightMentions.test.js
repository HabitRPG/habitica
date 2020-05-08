import mongoose from 'mongoose';
import highlightMentions from '../../../../website/server/libs/highlightMentions';

describe('highlightMentions', () => {
  beforeEach(() => {
    const mockFind = {
      select () {
        return this;
      },
      lean () {
        return this;
      },
      exec () {
        return Promise.resolve([
          { auth: { local: { username: 'user' } }, _id: '111' },
          { auth: { local: { username: 'user2' } }, _id: '222' },
          { auth: { local: { username: 'user3' } }, _id: '333' },
          { auth: { local: { username: 'user-dash' } }, _id: '444' },
          { auth: { local: { username: 'user_underscore' } }, _id: '555' },
        ]);
      },
    };

    sinon.stub(mongoose.Model, 'find').returns(mockFind);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('doesn\'t change text without mentions', async () => {
    const text = 'some chat text';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal(text);
  });

  it('highlights existing users', async () => {
    const text = '@user: message';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal('[@user](/profile/111): message');
  });

  it('highlights special characters', async () => {
    const text = '@user-dash: message @user_underscore';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal('[@user-dash](/profile/444): message [@user_underscore](/profile/555)');
  });

  it('doesn\'t highlight nonexisting users', async () => {
    const text = '@nouser message';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal('@nouser message');
  });

  it('highlights multiple existing users', async () => {
    const text = '@user message (@user2) @user3 @user';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal('[@user](/profile/111) message ([@user2](/profile/222)) [@user3](/profile/333) [@user](/profile/111)');
  });

  it('doesn\'t highlight more than 5 users', async () => {
    const text = '@user @user2 @user3 @user4 @user5 @user6';
    const result = await highlightMentions(text);
    expect(result[0]).to.equal(text);
  });

  describe('exceptions in code blocks', () => {
    it('doesn\'t highlight user in inline code block', async () => {
      const text = '`@user`';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight user in fenced code block', async () => {
      const text = 'Text\n\n```\n// code referencing @user\n```\n\nText';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight user in indented code block', async () => {
      const text = '      @user';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('does highlight user that\'s after in-line code block', async () => {
      const text = '`<code />` for @user';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal('`<code />` for [@user](/profile/111)');
    });

    it('does highlight same content properly', async () => {
      const text = '@user `@user`';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal('[@user](/profile/111) `@user`');
    });
  });

  it('github issue 12118, method crashes when square brackets are used', async () => {
    const text = '[test]';

    let err;

    try {
      await highlightMentions(text);
    } catch (e) {
      err = e;
    }

    expect(err).to.be.undefined;
  });

  it('github issue 12138, method crashes when regex chars are used in code block', async () => {
    const text = '`[test]`';

    let err;

    try {
      await highlightMentions(text);
    } catch (e) {
      err = e;
    }

    expect(err).to.be.undefined;
  });
});
