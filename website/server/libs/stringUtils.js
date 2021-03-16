export function normalizeUnicodeString (str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function removePunctuationFromString (str) {
  return str.replace(/[.,/#!@$%^&;:{}=\-_`~()]/g, ' ');
}

// NOTE: the wordsToMatch aren't escaped in order to support regular expressions,
// so this method should not be used if wordsToMatch contains unsanitized user input

export function getMatchesByWordArray (str, wordsToMatch) {
  // remove accented characters from the string, which would trip up the regEx
  // later on, by using the built-in Unicode normalisation methods
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  // https://www.unicode.org/reports/tr15/#Canon_Compat_Equivalence
  // https://unicode-table.com/en/#combining-diacritical-marks

  const matchedWords = [];
  const wordRegexs = wordsToMatch.map(word => {
    const normalizedWord = removePunctuationFromString(normalizeUnicodeString(word));
    return new RegExp(`\\b([^a-z]+)?${normalizedWord}([^a-z]+)?\\b`, 'i');
  });
  for (let i = 0; i < wordRegexs.length; i += 1) {
    const regEx = wordRegexs[i];
    const match = removePunctuationFromString(normalizeUnicodeString(str)).match(regEx);
    if (match !== null && match[0] !== null) {
      const trimmedMatch = match[0].trim();
      matchedWords.push(trimmedMatch);
    }
  }
  return matchedWords;
}
