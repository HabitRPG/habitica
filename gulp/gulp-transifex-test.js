import fs       from 'fs';
import _        from 'lodash';
import nconf    from 'nconf';
import gulp     from 'gulp';
import { postToSlack, conf } from './taskHelper';

const SLACK_CONFIG = {
  channel: conf.get('TRANSIFEX_SLACK_CHANNEL'),
  username: 'Transifex',
  emoji: 'transifex',
};

const LOCALES = './website/common/locales/';
const ENGLISH_LOCALE = `${LOCALES}en/`;
const ALL_LANGUAGES = getArrayOfLanguages();

const malformedStringExceptions = {
  messageDropFood: true,
  armoireFood: true,
  feedPet: true,
};

gulp.task('transifex', ['transifex:missingFiles', 'transifex:missingStrings', 'transifex:malformedStrings']);

gulp.task('transifex:missingFiles', () => {

  let missingStrings = [];

  eachTranslationFile(ALL_LANGUAGES, (error) => {
    if (error) {
      missingStrings.push(error.path);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    let message = 'the following files were missing from the translations folder';
    let formattedMessage = formatMessageForPosting(message, missingStrings);
    postToSlack(formattedMessage, SLACK_CONFIG);
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
    postToSlack(formattedMessage, SLACK_CONFIG);
  }
});

gulp.task('transifex:malformedStrings', () => {

  let jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));
  let interpolationRegex = /<%= [a-zA-Z]* %>/g;
  let stringsToLookFor = getStringsWith(jsonFiles, interpolationRegex);

  let stringsWithMalformedInterpolations = [];
  let stringsWithIncorrectNumberOfInterpolations = [];

  let count = 0;
  _(ALL_LANGUAGES).each(function (lang) {

    _.each(stringsToLookFor, function (strings, file) {
      let translationFile = fs.readFileSync(LOCALES + lang + '/' + file);
      let parsedTranslationFile = JSON.parse(translationFile);

      _.each(strings, function (value, key) {
        let translationString = parsedTranslationFile[key];
        if (!translationString) return;

        let englishOccurences = stringsToLookFor[file][key];
        let translationOccurences = translationString.match(interpolationRegex);

        if (!translationOccurences) {
          let malformedString = `${lang} - ${file} - ${key} - ${translationString}`;
          stringsWithMalformedInterpolations.push(malformedString);
        } else if (englishOccurences.length !== translationOccurences.length && !malformedStringExceptions[key]) {
          let missingInterploationString = `${lang} - ${file} - ${key} - ${translationString}`;
          stringsWithIncorrectNumberOfInterpolations.push(missingInterploationString);
        }
      });
    });
  }).value();

  if (!_.isEmpty(stringsWithMalformedInterpolations)) {
    let message = 'The following strings have malformed or missing interpolations';
    let formattedMessage = formatMessageForPosting(message, stringsWithMalformedInterpolations);
    postToSlack(formattedMessage, SLACK_CONFIG);
  }

  if (!_.isEmpty(stringsWithIncorrectNumberOfInterpolations)) {
    let message = 'The following strings have a different number of string interpolations';
    let formattedMessage = formatMessageForPosting(message, stringsWithIncorrectNumberOfInterpolations);
    postToSlack(formattedMessage, SLACK_CONFIG);
  }
});

function getArrayOfLanguages () {
  let languages = fs.readdirSync(LOCALES);
  languages.shift(); // Remove README.md from array of languages

  return languages;
}

function eachTranslationFile (languages, cb) {
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

      cb(null, lang, filename, parsedEnglishFile, parsedTranslationFile);
    });
  }).value();
}

function eachTranslationString (languages, cb) {
  eachTranslationFile(languages, (error, language, filename, englishJSON, translationJSON) => {
    if (error) return;
    _.each(englishJSON, (string, key) => {
      var translationString = translationJSON[key];
      cb(language, filename, key, string, translationString);
    });
  });
}

function formatMessageForPosting (msg, items) {
  let body = `*Warning:* ${msg}`;
  body += '\n\n```\n';
  body += items.join('\n');
  body += '\n```';

  return body;
}

function getStringsWith (json, interpolationRegex) {
  var strings = {};

  _(json).each(function (file_name) {
    var raw_file = fs.readFileSync(ENGLISH_LOCALE + file_name);
    var parsed_json = JSON.parse(raw_file);

    strings[file_name] = {};
    _.each(parsed_json, function (value, key) {
      var match = value.match(interpolationRegex);
      if (match) strings[file_name][key] = match;
    });
  }).value();

  return strings;
}

function stripOutNonJsonFiles (collection) {
  let onlyJson = _.filter(collection, (file) => {
    return file.match(/[a-zA-Z]*\.json/);
  });

  return onlyJson;
}
