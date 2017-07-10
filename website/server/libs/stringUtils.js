
export function removePunctuationFromString (str) {
  var punctuationless = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  return punctuationless.replace(/\s{2,}/g," ");
}

export function getMatchesByWordArray(str, wordsToMatch, removePunctuation) {
  var matchedWords = [];
  let wordRegexs = wordsToMatch.map((word) => new RegExp(`\\b([^a-z]+)?${word.toLowerCase()}([^a-z]+)?\\b`));
  for (let i = 0; i < wordRegexs.length; i += 1) {
    let regEx = wordRegexs[i];
    var match = str.toLowerCase().match(regEx);
    if (match !== null && match[0] !== null) {
      var word = match[0].trim();
      var matchedWord = removePunctuation ? removePunctuationFromString(word) : word;
      matchedWords.push(matchedWord);
    }
  }
  return matchedWords || [];
}
