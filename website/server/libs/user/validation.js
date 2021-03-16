import bannedSlurs from '../bannedSlurs';
import bannedWords from '../bannedWords';
import {
  getMatchesByWordArray,
  normalizeUnicodeString,
  removePunctuationFromString,
} from '../stringUtils';
import forbiddenUsernames from '../forbiddenUsernames';

const bannedSlurRegexes = bannedSlurs.map(word => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'));
const bannedWordRegexes = bannedWords.map(word => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'));

export function stringContainsProfanity (str, profanityType = 'bannedWord') {
  const bannedRegexes = profanityType === 'slur'
    ? bannedSlurRegexes
    : bannedWordRegexes;

  for (let i = 0; i < bannedRegexes.length; i += 1) {
    const regEx = bannedRegexes[i];
    const match = removePunctuationFromString(normalizeUnicodeString(str)).match(regEx);
    if (match !== null && match[0] !== null) {
      return true;
    }
  }
  return false;
}

export function nameContainsNewline (username) {
  return username.includes('\n');
}

function usernameIsForbidden (username) {
  const forbidddenWordsMatched = getMatchesByWordArray(username, forbiddenUsernames);
  return forbidddenWordsMatched.length > 0;
}

const invalidCharsRegex = new RegExp('[^a-z0-9_-]', 'i');
function usernameContainsInvalidCharacters (username) {
  const match = username.match(invalidCharsRegex);
  return match !== null && match[0] !== null;
}

export function verifyDisplayName (displayName, res) {
  const issues = [];
  if (displayName.length < 1 || displayName.length > 30) issues.push(res.t('displaynameIssueLength'));
  if (stringContainsProfanity(displayName)) issues.push(res.t('bannedWordUsedInProfile'));
  if (stringContainsProfanity(displayName, 'slur')) issues.push(res.t('bannedSlurUsedInProfile'));
  if (nameContainsNewline(displayName)) issues.push(res.t('displaynameIssueNewline'));

  return issues;
}

export function verifyUsername (username, res, newUser = true) {
  const slurMessage = newUser
    ? res.t('usernameIssueSlur')
    : res.t('bannedSlurUsedInProfile');
  const issues = [];
  if (username.length < 1 || username.length > 20) issues.push(res.t('usernameIssueLength'));
  if (usernameContainsInvalidCharacters(username)) issues.push(res.t('usernameIssueInvalidCharacters'));
  if (stringContainsProfanity(username, 'slur') || stringContainsProfanity(username)) issues.push(slurMessage);
  if (usernameIsForbidden(username)) issues.push(res.t('usernameIssueForbidden'));

  return issues;
}
