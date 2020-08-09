import bannedSlurs from '../bannedSlurs';
import bannedWords from '../bannedWords';
import { getMatchesByWordArray, normalizeUnicodeString } from '../stringUtils';
import forbiddenUsernames from '../forbiddenUsernames';

export function stringContainsProfanity (str, profanityType = 'bannedWord') {
  const bannedRegexes = profanityType === 'slur'
    ? bannedSlurs.map(word => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'))
    : bannedWords.map(word => new RegExp(`\\b([^a-z]+)?${word}([^a-z]+)?\\b`, 'i'));

  for (let i = 0; i < bannedRegexes.length; i += 1) {
    const regEx = bannedRegexes[i];
    const match = normalizeUnicodeString(str).match(regEx);
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
  if (stringContainsProfanity(displayName, 'slur') || stringContainsProfanity(displayName)) {
    issues.push(res.t('displaynameIssueSlur'));
  }
  if (nameContainsNewline(displayName)) issues.push(res.t('displaynameIssueNewline'));

  return issues;
}

export function verifyUsername (username, res) {
  const issues = [];
  if (username.length < 1 || username.length > 20) issues.push(res.t('usernameIssueLength'));
  if (usernameContainsInvalidCharacters(username)) issues.push(res.t('usernameIssueInvalidCharacters'));
  if (stringContainsProfanity(username, 'slur') || stringContainsProfanity(username)) issues.push(res.t('usernameIssueSlur'));
  if (usernameIsForbidden(username)) issues.push(res.t('usernameIssueForbidden'));

  return issues;
}
