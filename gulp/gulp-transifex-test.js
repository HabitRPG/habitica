import fs from 'fs';
import _ from 'lodash';
import gulp from 'gulp';
import { postToSlack, conf } from './taskHelper';

const SLACK_CONFIG = {
  channel: conf.get('TRANSIFEX_SLACK_CHANNEL'),
  username: 'Transifex',
  emoji: 'transifex',
};

const LOCALES = './website/common/locales/';
const ENGLISH_LOCALE = `${LOCALES}en/`;

function getArrayOfLanguages () {
  const languages = fs.readdirSync(LOCALES);
  languages.shift(); // Remove README.md from array of languages

  return languages;
}

const ALL_LANGUAGES = getArrayOfLanguages();

function stripOutNonJsonFiles (collection) {
  const onlyJson = _.filter(collection, file => file.match(/[a-zA-Z]*\.json/));

  return onlyJson;
}

function eachTranslationFile (languages, cb) {
  const jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));

  _.each(languages, lang => {
    _.each(jsonFiles, filename => {
      let parsedTranslationFile;
      try {
        const translationFile = fs.readFileSync(`${LOCALES}${lang}/${filename}`);
        parsedTranslationFile = JSON.parse(translationFile);
      } catch (err) {
        return cb(err);
      }

      const englishFile = fs.readFileSync(ENGLISH_LOCALE + filename);
      const parsedEnglishFile = JSON.parse(englishFile);

      return cb(null, lang, filename, parsedEnglishFile, parsedTranslationFile);
    });
  });
}

function eachTranslationString (languages, cb) {
  eachTranslationFile(languages, (error, language, filename, englishJSON, translationJSON) => {
    if (error) return;
    _.each(englishJSON, (string, key) => {
      const translationString = translationJSON[key];
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
  const strings = {};

  _.each(json, fileName => {
    const rawFile = fs.readFileSync(ENGLISH_LOCALE + fileName);
    const parsedJson = JSON.parse(rawFile);

    strings[fileName] = {};
    _.each(parsedJson, (value, key) => {
      const match = value.match(interpolationRegex);
      if (match) strings[fileName][key] = match;
    });
  });

  return strings;
}

const malformedStringExceptions = {
  messageDropFood: true,
  armoireFood: true,
  feedPet: true,
};

gulp.task('transifex:missingFiles', done => {
  const missingStrings = [];

  eachTranslationFile(ALL_LANGUAGES, error => {
    if (error) {
      missingStrings.push(error.path);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    const message = 'the following files were missing from the translations folder';
    const formattedMessage = formatMessageForPosting(message, missingStrings);
    postToSlack(formattedMessage, SLACK_CONFIG);
  }
  done();
});

gulp.task('transifex:missingStrings', done => {
  const missingStrings = [];

  eachTranslationString(ALL_LANGUAGES, (lang, filename, key, englishString, translationString) => {
    if (!translationString) {
      const errorString = `${lang} - ${filename} - ${key} - ${englishString}`;
      missingStrings.push(errorString);
    }
  });

  if (!_.isEmpty(missingStrings)) {
    const message = 'The following strings are not translated';
    const formattedMessage = formatMessageForPosting(message, missingStrings);
    postToSlack(formattedMessage, SLACK_CONFIG);
  }
  done();
});

gulp.task('transifex:malformedStrings', done => {
  const jsonFiles = stripOutNonJsonFiles(fs.readdirSync(ENGLISH_LOCALE));
  const interpolationRegex = /<%= [a-zA-Z]* %>/g;
  const stringsToLookFor = getStringsWith(jsonFiles, interpolationRegex);

  const stringsWithMalformedInterpolations = [];
  const stringsWithIncorrectNumberOfInterpolations = [];

  _.each(ALL_LANGUAGES, lang => {
    _.each(stringsToLookFor, (strings, filename) => {
      const translationFile = fs.readFileSync(`${LOCALES}${lang}/${filename}`);
      const parsedTranslationFile = JSON.parse(translationFile);

      _.each(strings, (value, key) => { // eslint-disable-line max-nested-callbacks
        const translationString = parsedTranslationFile[key];
        if (!translationString) return;

        const englishOccurences = stringsToLookFor[filename][key];
        const translationOccurences = translationString.match(interpolationRegex);

        if (!translationOccurences) {
          const malformedString = `${lang} - ${filename} - ${key} - ${translationString}`;
          stringsWithMalformedInterpolations.push(malformedString);
        } else if (
          englishOccurences.length !== translationOccurences.length
           && !malformedStringExceptions[key]
        ) {
          const missingInterpolationString = `${lang} - ${filename} - ${key} - ${translationString}`;
          stringsWithIncorrectNumberOfInterpolations.push(missingInterpolationString);
        }
      });
    });
  });

  if (!_.isEmpty(stringsWithMalformedInterpolations)) {
    const message = 'The following strings have malformed or missing interpolations';
    const formattedMessage = formatMessageForPosting(message, stringsWithMalformedInterpolations);
    postToSlack(formattedMessage, SLACK_CONFIG);
  }

  if (!_.isEmpty(stringsWithIncorrectNumberOfInterpolations)) {
    const message = 'The following strings have a different number of string interpolations';
    const formattedMessage = formatMessageForPosting(
      message,
      stringsWithIncorrectNumberOfInterpolations,
    );
    postToSlack(formattedMessage, SLACK_CONFIG);
  }
  done();
});

gulp.task(
  'transifex',
  gulp.series('transifex:missingFiles', 'transifex:missingStrings', 'transifex:malformedStrings'),
  done => done(),
);
