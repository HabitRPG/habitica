import fs      from 'fs';
import _       from 'lodash';
import nconf   from 'nconf';
import gulp    from 'gulp';
import request from 'superagent';

nconf.argv().env().file({ file: 'config.json' });

const LOCALES = './common/locales/';
const ENGLISH_LOCALE = `${LOCALES}en/`;

const SLACK_URL = nconf.get('TRANSIFEX_SLACK:url');
const SLACK_CHANNEL = '#' + nconf.get('TRANSIFEX_SLACK:channel');
const SLACK_USERNAME = 'Transifex';
const SLACK_EMOJI = ':transifex:';

gulp.task('transifex:exists', () => {

  var missingStrings = [];

  eachTranslationString((language, key, englishString, translationString) => {
    if(!translationString) {
      let errorString = `${language} - ${key} - ${englishString}`;
      missingStrings.push(errorString);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    post('The following strings are missing', missingStrings);
  }
});

function eachTranslationFile(cb) {
  let languages = fs.readdirSync(LOCALES);
  languages.shift(); // Remove README.md from array of languages

  let jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));

  _(languages).each((lang) => {
    _.each(jsonFiles, (file) => {
      let translationFile = fs.readFileSync(LOCALES + lang + '/' + file);
      let parsedTranslationFile = JSON.parse(translationFile);

      let englishFile = fs.readFileSync(ENGLISH_LOCALE + file);
      let parsedEnglishFile = JSON.parse(englishFile);

      cb(lang, parsedEnglishFile, parsedTranslationFile)
    });
  });
}

function eachTranslationString(cb) {
  eachTranslationFile((language, englishJSON, translationJSON) => {
    _.each(englishJSON, (string, key) => {
      var translationString = translationJSON[key];
      cb(language, key, string, translationString);
    });
  });
}

function checkForIssues(thingToCheck) {
  let hasIssues = !_.isEmpty(thingToCheck);
  return hasIssues;
}

function post(message, items) {
  let formattedMessage = formatMessageForPosting(message, items);

  request.post(SLACK_URL)
    .send({
      channel: SLACK_CHANNEL,
      username: SLACK_USERNAME,
      text: formattedMessage,
      icon_emoji: SLACK_EMOJI
    })
    .end((err, res) => {
      if (err) console.error('Unable to post to slack', err);
    });
}

function formatMessageForPosting(msg, items) {
  let body = `*Warning:* ${msg}`;
  body += '\n\n```\n';
  body += items.join('\n');
  body += '\n```';

  return body;
}

function stripOutNonJsonFiles(collection) {
  let onlyJson = _.filter(collection, (file) => {
    return file.match(/[a-zA-Z]*\.json/);
  });

  return onlyJson;
}
