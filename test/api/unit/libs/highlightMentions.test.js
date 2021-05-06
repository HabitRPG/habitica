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
      async exec () {
        return [
          { auth: { local: { username: 'user' } }, _id: '111' },
          { auth: { local: { username: 'user2' } }, _id: '222' },
          { auth: { local: { username: 'user3' } }, _id: '333' },
          { auth: { local: { username: 'user-dash' } }, _id: '444' },
          { auth: { local: { username: 'user_underscore' } }, _id: '555' },
        ];
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

  describe('link interactions', async () => {
    it('doesn\'t highlight users in link', async () => {
      const text = 'http://www.medium.com/@user/blog';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight user in link between brackets', async () => {
      const text = '(http://www.medium.com/@user/blog)';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight user in an autolink', async () => {
      const text = '<http://www.medium.com/@user/blog>';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight users in link text', async () => {
      const text = '[Check awesome blog written by @user](http://www.medium.com/@user/blog)';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight users in link with newlines and markup', async () => {
      const text = '[Check `awesome` \nblog **written** by @user](http://www.medium.com/@user/blog)';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    it('doesn\'t highlight users in link when followed by same @user mention', async () => {
      const text = 'http://www.medium.com/@user/blog @user';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal('http://www.medium.com/@user/blog [@user](/profile/111)');
    });

    // https://spec.commonmark.org/0.29/#example-483
    it('doesn\'t highlight user in a link without url', async () => {
      const text = '[@user2]()';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    // https://github.com/HabitRPG/habitica/issues/12217
    it('doesn\'t highlight user in link with url-escapable characters', async () => {
      const text = '[test](https://habitica.fandom.com/ru/@wiki/Снаряжение)';
      const result = await highlightMentions(text);
      expect(result[0]).to.equal(text);
    });

    // https://github.com/HabitRPG/habitica/issues/12223
    it('matches a link in between two the same links', async () => {
      const text = '[here](http://habitica.wikia.com/wiki/The_Keep:Pirate_Cove/FAQ)\n@user\n[hier](http://habitica.wikia.com/wiki/The_Keep:Pirate_Cove/FAQ)';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal('[here](http://habitica.wikia.com/wiki/The_Keep:Pirate_Cove/FAQ)\n[@user](/profile/111)\n[hier](http://habitica.wikia.com/wiki/The_Keep:Pirate_Cove/FAQ)');
    });
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

  describe('issues', () => {
    it('github issue 12118, method crashes when square brackets are used', async () => {
      const text = '[test]';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('github issue 12138, method crashes when regex chars are used in code block', async () => {
      const text = '`[test]`';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('github issue 12586, method crashes when empty link is used', async () => {
      const text = '[]()';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });

    it('github issue 12586, method crashes when link without title is used', async () => {
      const text = '[](www.google.com)';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal(text);
    });
  });

  describe('base url', () => {
    it('should prefix habitica.com if it is production', async () => {
      const OLD_NODE_ENV = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const text = '@user';

      const result = await highlightMentions(text);

      expect(result[0]).to.equal('[@user](https://habitica.com/profile/111)');
      process.env.NODE_ENV = OLD_NODE_ENV;
    });
  });
});
