import habiticaMarkdown from 'habitica-markdown/withMentions';

export default function renderWithMentions (text, user) {
  if (!text) return null;
  const env = { userName: user.auth.local.username };
  return habiticaMarkdown.render(String(text), env);
}
