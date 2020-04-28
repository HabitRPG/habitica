export function removePunctuationFromString (str) {
  return str.replace(/[.,/#!@$%^&;:{}=\-_`~()]/g, ' ');
}

// NOTE: the wordsToMatch aren't escaped in order to support regular expressions,
// so this method should not be used if wordsToMatch contains unsanitized user input
export function getMatchesByWordArray (str, wordsToMatch) {
  const matchedWords = [];
  const wordRegexs = wordsToMatch.map(word => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'));
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
