import habiticaMarkdown from 'habitica-markdown/withMentions';

export default function renderWithMentions (text, user) {
  if (!text) return null;
  const env = { userName: user.auth.local.username, displayName: user.profile.name };
  let html = habiticaMarkdown.render(String(text), env);
  if (user.profile.name && user.profile.name !== user.auth.local.username) {
    const escapedDisplayName = user.profile.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const displayNameRegex = new RegExp(
      `(<span class="at-text) at-highlight(">@${escapedDisplayName}</span>)`,
      'gi',
    );
    html = html.replace(displayNameRegex, '$1$2');
  }
  return html;
}
