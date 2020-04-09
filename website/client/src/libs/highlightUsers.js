import escapeRegExp from 'lodash/escapeRegExp';

const optionalAnchorTagRegExStr = '(<\\w[^>]*)?'; // everything including the anchor tag is recognized
const mentionRegExStr = '(@[<em>\\w-</em>]+)';
const optionalPostMentionRegExStr = '(\\.\\w+)?'; // like dot-TLD

const finalMentionRegEx = new RegExp(`${optionalAnchorTagRegExStr}${mentionRegExStr}${optionalPostMentionRegExStr}`, 'gi');

export function highlightUsers (text, userName, displayName) { // eslint-disable-line import/prefer-default-export, max-len
  const currentUser = [`@${userName}`, `@${displayName}`].map(escapeRegExp);

  text = text.replace(finalMentionRegEx, (fullMatched, preMention, mentionStr, postMention) => { // eslint-disable-line no-param-reassign, max-len
    if ((preMention && preMention.includes('<a')) || Boolean(postMention)) {
      return fullMatched;
    }

    let fixedStr = mentionStr;
    if (mentionStr.includes('<em>')) {
      fixedStr = mentionStr.replace('<em>', '_');
      fixedStr = fixedStr.replace('</em>', '_');
    }
    const isUserMention = currentUser.includes(mentionStr) ? 'at-highlight' : '';

    return fullMatched.replace(mentionStr, `<span class="at-text ${isUserMention}">${fixedStr}</span>`);
  });

  return text;
}
