export function highlightUsers (text, userName, displayName) {
  const findAnyMentionRegex = '@[\\w-]+(?:\\b)';

  const atRegex = new RegExp(`${findAnyMentionRegex}`, 'gi');
  const currentUser = [`@${userName}`, `@${displayName}`];

  if (atRegex.test(text)) {
    text = text.replace(atRegex, match => {
      if (currentUser.includes(match)) {
        return `<span class="at-highlight at-text">${match}</span>`;
      }

      return `<span class="at-text">${match}</span>`;
    });
  }

  return text;
}
