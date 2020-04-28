import escapeRegExp from 'lodash/escapeRegExp';

export function removePunctuationFromString (str) {
  return str.replace(/[.,/#!@$%^&;:{}=\-_`~()]/g, ' ');
}

export function getMatchesByWordArray (str, wordsToMatch) {
  const matchedWords = [];
  const wordRegexs = wordsToMatch.map(word => {
    const escapedWord = escapeRegExp(word);
    return new RegExp(`\\b([^a-z]+)?${escapedWord}([^a-z]+)?\\b`, 'i');
  });
  for (let i = 0; i < wordRegexs.length; i += 1) {
    const regEx = wordRegexs[i];
    const match = str.match(regEx);
    if (match !== null && match[0] !== null) {
      const trimmedMatch = removePunctuationFromString(match[0]).trim();
      matchedWords.push(trimmedMatch);
    }
  }
  return matchedWords;
}
