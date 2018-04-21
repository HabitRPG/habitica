
export function removePunctuationFromString (str) {
  return str.replace(/[.,\/#!@$%\^&;:{}=\-_`~()]/g, ' ');
}

export function getMatchesByWordArray (str, wordsToMatch) {
  let matchedWords = [];
  let wordRegexs = wordsToMatch.map((word) => new RegExp(`\\b([^a-z]+)?${word.toLowerCase()}([^a-z]+)?\\b`));
  for (let i = 0; i < wordRegexs.length; i += 1) {
    let regEx = wordRegexs[i];
    let match = str.toLowerCase().match(regEx);
    if (match !== null && match[0] !== null) {
      let trimmedMatch = removePunctuationFromString(match[0]).trim();
      matchedWords.push(trimmedMatch);
    }
  }
  return matchedWords;
}
