import escapeRegExp from 'lodash/escapeRegExp';

const optionalAnchorTagRegExStr = '(<\\w[^>]*)?'; // everything including the anchor tag is recognized
const mentionRegExStr = '(@[\\w-]+)';
const optionalPostMentionRegExStr = '(\\.\\w+)?'; // like dot-TLD

const finalMentionRegEx = new RegExp(`${optionalAnchorTagRegExStr}${mentionRegExStr}${optionalPostMentionRegExStr}`, 'gi');

export function highlightUsers (text, userName, displayName) {
  const currentUser = [`@${userName}`, `@${displayName}`].map(escapeRegExp);

  text = text.replace(finalMentionRegEx, (fullMatched, preMention, mentionStr, postMention) => {
    if (preMention && preMention.includes('<a') || Boolean(postMention)) {
      return fullMatched;
    }

    const isUserMention = currentUser.includes(mentionStr) ? 'at-highlight' : '';

    return fullMatched.replace(mentionStr, `<span class="at-text ${isUserMention}">${mentionStr}</span>`);
  });

  return text;
}
