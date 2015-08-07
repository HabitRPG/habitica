import fs      from 'fs';
import _       from 'lodash';
import nconf   from 'nconf';
import md5     from 'md5';
import gulp    from 'gulp';
import request from 'superagent';

nconf.argv().env().file({ file: 'config.json' });

const LOCALES = './common/locales/';
const ENGLISH_LOCALE = `${LOCALES}en/`;

const SLACK_URL = nconf.get('TRANSIFEX_SLACK:url');
const SLACK_CHANNEL = '#' + nconf.get('TRANSIFEX_SLACK:channel');
const SLACK_USERNAME = 'Transifex';
const SLACK_EMOJI = ':transifex:';

gulp.task('transifex:look', () => {
  // curl -i -L --user username:password -X GET https://www.transifex.com/api/2/project/transifex/resource/core/translation/pt_BR/string/e9fbd679f07d178744bfa80344080962/
  // /project/<project_slug>/resource/<resource_slug>/translation/<language_code>/string/<source_hash>/
  // request.get('https://www.transifex.com/api/2/project/habitrpg/resource/petsjson/translation/uk/string/7541ebdf41af9839f458f9afb1644882/')
  //   .end((err, res) => {
  //     if (err) console.log(":(", err);
  //     else console.log(res.body);
  //   });
});

gulp.task('transifex:untranslatedStrings', () => {

  let missingStrings = [];
  let languages = getArrayOfLanguages();

  eachTranslationString(languages, (language, filename, key, englishString, translationString) => {
    if(!translationString) {
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

function getEnglishLanguages(cb) {
  let allLanguages = getArrayOfLanguages();

  let nonEnglishLanguages = _.filter(allLanguages, (lang) => {
    return lang.indexOf('en') !== 0;
  });

  return nonEnglishLanguages;
}


function eachTranslationFile(languages, cb) {
  let jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));

  _(languages).each((lang) => {
    _.each(jsonFiles, (filename) => {
      let translationFile = fs.readFileSync(LOCALES + lang + '/' + filename);
      let parsedTranslationFile = JSON.parse(translationFile);

      let englishFile = fs.readFileSync(ENGLISH_LOCALE + filename);
      let parsedEnglishFile = JSON.parse(englishFile);

      cb(lang, filename, parsedEnglishFile, parsedTranslationFile)
    });
  });
}

function eachTranslationString(languages, cb) {
  eachTranslationFile(languages, (language, filename, englishJSON, translationJSON) => {
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
  body += '\n\n```\n';
  body += items.join('\n');
  body += '\n```';

  return body;
}

function getHash(string) {
  let hash = md5(`${string}:`);
  return hash;
}

function stripOutNonJsonFiles(collection) {
  let onlyJson = _.filter(collection, (file) => {
    return file.match(/[a-zA-Z]*\.json/);
  });

  return onlyJson;
}
