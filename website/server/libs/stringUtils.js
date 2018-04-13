
export function removePunctuationFromString (str) {
  return str.replace(/[.,\/#!@$%\^&;:{}=\-_`~()]/g, ' ');
}

export function getMatchesByWordArray (str, wordsToMatch) {
  let matchedWords = [];
  let wordRegexs = wordsToMatch.map((word) => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'));
  for (let i = 0; i < wordRegexs.length; i += 1) {
    let regEx = wordRegexs[i];
    let match = str.match(regEx);
    if (match !== null && match[0] !== null) {
      let trimmedMatch = removePunctuationFromString(match[0]).trim();
      matchedWords.push(trimmedMatch);
    }
  }
  return matchedWords;
}
