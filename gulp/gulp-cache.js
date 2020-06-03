import gulp from 'gulp';
import fs from 'fs';

// TODO parallelize, use gulp file helpers
gulp.task('cache:content', done => {
  // Requiring at runtime because these files access `common`
  // code which in production works only if transpiled so after
  // gulp build:babel:common has run
  const { CONTENT_CACHE_PATH, getLocalizedContentResponse } = require('../website/server/libs/content'); // eslint-disable-line global-require
  const { langCodes } = require('../website/server/libs/i18n'); // eslint-disable-line global-require

  try {
    // create the cache folder (if it doesn't exist)
    try {
      fs.mkdirSync(CONTENT_CACHE_PATH);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // clone the content for each language and save
    // localize it
    // save the result
    langCodes.forEach(langCode => {
      fs.writeFileSync(
        `${CONTENT_CACHE_PATH}${langCode}.json`,
        getLocalizedContentResponse(langCode),
        'utf8',
      );
    });
    done();
  } catch (err) {
    done(err);
  }
});

gulp.task('cache:i18n', done => {
  // Requiring at runtime because these files access `common`
  // code which in production works only if transpiled so after
  // gulp build:babel:common has run
  const { BROWSER_SCRIPT_CACHE_PATH, geti18nBrowserScript } = require('../website/server/libs/i18n'); // eslint-disable-line global-require
  const { langCodes } = require('../website/server/libs/i18n'); // eslint-disable-line global-require

  try {
    // create the cache folder (if it doesn't exist)
    try {
      fs.mkdirSync(BROWSER_SCRIPT_CACHE_PATH);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // create and save the i18n browser script for each language
    langCodes.forEach(languageCode => {
      fs.writeFileSync(
        `${BROWSER_SCRIPT_CACHE_PATH}${languageCode}.js`,
        geti18nBrowserScript(languageCode),
        'utf8',
      );
    });
    done();
  } catch (err) {
    done(err);
  }
});
