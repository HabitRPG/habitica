import habiticaMarkdown from 'habitica-markdown';
import { highlightUsers } from '@/libs/highlightUsers';

describe('highlightUserAndEmail', () => {
  it('highlights displayname', () => {
    const text = 'hello @displayedUser with text after';

    const result = highlightUsers(text, 'user', 'displayedUser');

    expect(result).to.contain('<span class="at-text at-highlight">@displayedUser</span>');
  });

  it('highlights username', () => {
    const text = 'hello @user';

    const result = highlightUsers(text, 'user', 'displayedUser');
    expect(result).to.contain('<span class="at-text at-highlight">@user</span>');
  });

  it('highlights username sandwiched with underscores', () => {
    const text = 'hello @<em>user</em>';

    const result = highlightUsers(text, '_user_', 'displayedUser');
    expect(result).to.contain('<span class="at-text at-highlight">@_user_</span>');
    expect(result).to.not.contain('<em>');
    expect(result).to.not.contain('</em>');
  });

  it('highlights username sandwiched with double underscores', () => {
    const text = 'hello @<strong>user</strong>';

    const result = highlightUsers(text, 'diffUser', 'displayDiffUser');
    expect(result).to.contain('<span class="at-text at-highlight">@__user__</span>');
    expect(result).to.not.contain('<strong>');
    expect(result).to.not.contain('</strong>');
  });

  it('not highlights any email', () => {
    const text = habiticaMarkdown.render('hello@example.com');

    const result = highlightUsers(text, 'example', 'displayedUser');
    expect(result).to.not.contain('<span class="at-highlight">@example</span>');
  });


  it('complex highlight', () => {
    const plainText = 'a bit more @mentions to @use my@mentions.com broken.@mail.com';

    const text = habiticaMarkdown.render(plainText);

    const result = highlightUsers(text, 'use', 'mentions');

    expect(result).to.contain('<span class="at-text at-highlight">@mentions</span>');
    expect(result).to.contain('<span class="at-text at-highlight">@use</span>');
    expect(result).to.not.contain('<span class="at-text at-highlight">@mentions</span>.com');
  });
});
