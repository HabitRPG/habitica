import {highlightUsers} from '../../../../../website/client/libs/highlightUsers';
import habiticaMarkdown from 'habitica-markdown';

describe('highlightUserAndEmail', () => {
  it('highlights displayname', () => {
    const text = 'hello @displayedUser';

    const result = highlightUsers(text, 'user', 'displayedUser');
    expect(result).to.contain('<span class="at-highlight at-text">@displayedUser</span>');
  });

  it('highlights username', () => {
    const text = 'hello @user';

    const result = highlightUsers(text, 'user', 'displayedUser');
    expect(result).to.contain('<span class="at-highlight at-text">@user</span>');
  });

  it('highlights email with username', () => {
    const text = habiticaMarkdown.render('hello hello@user.com');

    const result = highlightUsers(text, 'user', 'displayedUser');
    expect(result).to.contain('>hello<span class="at-highlight at-text">@user</span>.com</a>');
  });

  it('highlights any mention', () => {
    const text = habiticaMarkdown.render('hello y.@user.com other words');

    const result = highlightUsers(text, 'test', 'displayedUser');
    expect(result).to.contain('<span class="at-text">@user</span>');
  });
});
