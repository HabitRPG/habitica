import bannedSlurs from '../bannedSlurs';
import bannedWords from '../bannedWords';
import { getMatchesByWordArray } from '../stringUtils';
import forbiddenUsernames from '../forbiddenUsernames';

const bannedSlurRegexs = bannedSlurs.map(word => new RegExp(`.*${word}.*`, 'i'));
const bannedWordsRegexs = bannedWords.map(word => new RegExp(`.*${word}.*`, 'i'));

export function stringContainsSlur (username) {
  let x = 0;
  while (x < bannedSlurRegexs.length){
    const regEx = bannedSlurRegexs[x];
    const match = username.match(regEx);
    if (match !== null && match[0] !== null) {
      return true;
    }
    x += 1;
  }
  return false;
}

export function stringContainsBannedWord (username) {
  let x = 0;
  while (x < bannedWordsRegexs.length){
    const regEx = bannedWordsRegexs[x];
    const match = username.match(regEx);
    if (match !== null && match[0] !== null) {
      return true;
    }
    x += 1;
  }
  return false;
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
  if (stringContainsSlur(displayName)) issues.push(res.t('displaynameIssueSlur'));
  if (stringContainsBannedWord(displayName)) issues.push(res.t('displaynameIssueSlur'));

  return issues;
}

export function verifyUsername (username, res) {
  const issues = [];
  if (username.length < 1 || username.length > 20) issues.push(res.t('usernameIssueLength'));
  if (usernameContainsInvalidCharacters(username)) issues.push(res.t('usernameIssueInvalidCharacters'));
  if (stringContainsSlur(username)) issues.push(res.t('usernameIssueSlur'));
  if (usernameIsForbidden(username)) issues.push(res.t('usernameIssueForbidden'));

  return issues;
}
