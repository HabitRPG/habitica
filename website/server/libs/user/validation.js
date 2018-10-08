import bannedSlurs from '../bannedSlurs';
import {getMatchesByWordArray} from '../stringUtils';
import forbiddenUsernames from '../forbiddenUsernames';

const bannedSlurRegexs = bannedSlurs.map((word) => new RegExp(`.*${word}.*`, 'i'));

export function nameContainsSlur (username) {
  for (let i = 0; i < bannedSlurRegexs.length; i += 1) {
    const regEx = bannedSlurRegexs[i];
    const match = username.match(regEx);
    if (match !== null && match[0] !== null) {
      return true;
    }
  }
  return false;
}

function usernameIsForbidden (username) {
  const forbidddenWordsMatched = getMatchesByWordArray(username, forbiddenUsernames);
  return forbidddenWordsMatched.length > 0;
}

const invalidCharsRegex = new RegExp('[^a-z0-9_-]', 'i');
function usernameContainsInvalidCharacters (username) {
  let match = username.match(invalidCharsRegex);
  return match !== null && match[0] !== null;
}

export function verifyUsername (username, res) {
  let issues = [];
  if (username.length < 1 || username.length > 20) issues.push(res.t('usernameIssueLength'));
  if (usernameContainsInvalidCharacters(username)) issues.push(res.t('usernameIssueInvalidCharacters'));
  if (nameContainsSlur(username)) issues.push(res.t('usernameIssueSlur'));
  if (usernameIsForbidden(username)) issues.push(res.t('usernameIssueForbidden'));

  return issues;
}
