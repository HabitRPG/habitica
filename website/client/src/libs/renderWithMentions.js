import habiticaMarkdown from 'habitica-markdown/withMentions';
import escapeRegExp from 'lodash/escapeRegExp';

export default function renderWithMentions (text, user) {
  if (!text) return null;
  const env = { userName: user.auth.local.username };
  let html = habiticaMarkdown.render(String(text), env);

  if (user.auth.local.username) {
    const username = escapeRegExp(user.auth.local.username);
    const regex = new RegExp(`(<span class="at-text">@)(${username})(</span>)`, 'gi');
    html = html.replace(regex, (match, p1, p2, p3) => `${p1.replace('at-text', 'at-text at-highlight')}${p2}${p3}`);
  }

  return html;
}
