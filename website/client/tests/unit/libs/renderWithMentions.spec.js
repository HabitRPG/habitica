import { describe, expect, test } from 'vitest';
import renderMarkdown from '@/libs/renderWithMentions';

describe('renderWithMentions', () => {
  function user (name, displayName) {
    return { auth: { local: { username: name } }, profile: { name: displayName } };
  }

  test('returns null if no text supplied', () => {
    const result = renderMarkdown('', user('a', 'b'));

    expect(result).to.be.null;
  });

  test('does not highlight displayname to prevent impersonation', () => {
    const text = 'hello @displayedUser with text after';

    const result = renderMarkdown(text, user('user', 'displayedUser'));
    expect(result).to.contain('<span class="at-text">@displayedUser</span>');
    expect(result).to.not.contain('<span class="at-text at-highlight">@displayedUser</span>');
  });

  test('highlights username', () => {
    const text = 'hello @user';

    const result = renderMarkdown(text, user('user', 'displayedUser'));
    expect(result).to.contain('<span class="at-text at-highlight">@user</span>');
  });

  test('highlights username sandwiched with underscores', () => {
    const text = 'hello @_user_';

    const result = renderMarkdown(text, user('_user_', 'displayedUser'));
    expect(result).to.contain('<span class="at-text at-highlight">@_user_</span>');
    expect(result).to.not.contain('<em>');
    expect(result).to.not.contain('</em>');
  });

  test('highlights username sandwiched with double underscores', () => {
    const text = 'hello @__user__';

    const result = renderMarkdown(text, user('diffUser', 'displayDiffUser'));
    expect(result).to.contain('<span class="at-text">@__user__</span>');
    expect(result).to.not.contain('<strong>');
    expect(result).to.not.contain('</strong>');
  });

  test('not highlights any email', () => {
    const result = renderMarkdown('hello@example.com', user('example', 'displayedUser'));

    expect(result).to.not.contain('<span class="at-highlight">@example</span>');
  });

  test('complex highlight', () => {
    const plainText = 'a bit more @mentions to @use my@mentions.com broken @mail.com';

    const result = renderMarkdown(plainText, user('use', 'mentions'));

    expect(result).to.contain('<span class="at-text">@mentions</span>');
    expect(result).to.not.contain('<span class="at-text at-highlight">@mentions</span>');
    expect(result).to.contain('<span class="at-text at-highlight">@use</span>');
    expect(result).to.contain('<span class="at-text">@mail</span>');
    expect(result).to.not.contain('<span class="at-text at-highlight">@mentions</span>.com');
  });
});
