
import escapeRegExp from 'lodash/escapeRegExp';

export function highlightUsers (text, userName, displayName) {
  const escapedDisplayName = escapeRegExp(displayName);
  const escapedUsername = escapeRegExp(userName);

  const findCurrentUserRegex = `@(${escapedDisplayName}|${escapedUsername})(?:\\b)`;
  const findAnyOtherUserRegex = '(?!\\b)@[\\w-]+(?:\\b)';
  const notInsideHtmlTagsRegex = '(?<!<\/?[^>]*|&[^;]*)';
  const userRegex = new RegExp(`${notInsideHtmlTagsRegex}${findCurrentUserRegex}`, 'gi');

  if (userRegex.test(text)) {
    text = text.replace(userRegex, match => {
      return `<span class="at-highlight at-text">${match}</span>`;
    });
  }

  const atRegex = new RegExp(`${notInsideHtmlTagsRegex}${findAnyOtherUserRegex}`, 'gi');

  if (atRegex.test(text)) {
    text = text.replace(atRegex, match => {
      return `<span class="at-text">${match}</span>`;
    });
  }

  return text;
}
