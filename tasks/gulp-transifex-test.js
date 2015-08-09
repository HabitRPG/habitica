import fs      from 'fs';
import _       from 'lodash';
import nconf   from 'nconf';
import md5     from 'md5';
import gulp    from 'gulp';
import request from 'superagent';

nconf.argv().env().file({ file: 'config.json' });

const LOCALES = './common/locales/';
const ENGLISH_LOCALE = `${LOCALES}en/`;
const ALL_LANGUAGES = getArrayOfLanguages();

const SLACK_URL = nconf.get('TRANSIFEX_SLACK:url');
const SLACK_CHANNEL = '#' + nconf.get('TRANSIFEX_SLACK:channel');
const SLACK_USERNAME = 'Transifex';
const SLACK_EMOJI = ':transifex:';

gulp.task('transifex:missingFiles', () => {
  let missingStrings = [];

  eachTranslationFile(ALL_LANGUAGES, (error) => {
    if(error) {
      missingStrings.push(error.path);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    let message = 'the following files were missing from the translations folder';
    post(message, missingStrings);
  }
});

gulp.task('transifex:missingStrings', () => {

  let missingStrings = [];

  eachTranslationString(ALL_LANGUAGES, (language, filename, key, englishString, translationString) => {
    if (!translationString) {
      let errorString = `${language} - ${filename} - ${key} - ${englishString}`;
      missingStrings.push(errorString);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    let message = 'The following strings are not translated';
    let formattedMessage = formatMessageForPosting(message, missingStrings);
    console.log(formattedMessage);
  }
});

function getArrayOfLanguages() {
  let languages = fs.readdirSync(LOCALES);
  languages.shift(); // Remove README.md from array of languages

  return languages;
}

function getNonEnglishLanguages() {
  let nonEnglishLanguages = _.filter(ALL_LANGUAGES, (lang) => {
    return lang.indexOf('en') !== 0;
  });

  return nonEnglishLanguages;
}

function eachTranslationFile(languages, cb) {
  let jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));

  _(languages).each((lang) => {
    _.each(jsonFiles, (filename) => {
      try {
        var translationFile = fs.readFileSync(LOCALES + lang + '/' + filename);
        var parsedTranslationFile = JSON.parse(translationFile);
      } catch (err) {
        return cb(err);
      }

      let englishFile = fs.readFileSync(ENGLISH_LOCALE + filename);
      let parsedEnglishFile = JSON.parse(englishFile);

      cb(null, lang, filename, parsedEnglishFile, parsedTranslationFile)
    });
  });
}

function eachTranslationString(languages, cb) {
  eachTranslationFile(languages, (error, language, filename, englishJSON, translationJSON) => {
    if (error) return;
    _.each(englishJSON, (string, key) => {
      var translationString = translationJSON[key];
      cb(language, filename, key, string, translationString);
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
  body += '\n\n>>>\n';
  body += items.join('\n');

  return body;
}

function stripOutNonJsonFiles(collection) {
  let onlyJson = _.filter(collection, (file) => {
    return file.match(/[a-zA-Z]*\.json/);
  });

  return onlyJson;
}
