import habiticaMarkdown from 'habitica-markdown';

export default function renderMarkdown (text, user) {
  if (!text) return null;
  const env = { userName: user.auth.local.username, displayName: user.profile.name };
  return habiticaMarkdown.render(text, env);
}
