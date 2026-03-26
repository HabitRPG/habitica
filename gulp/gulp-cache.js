import gulp from 'gulp';
import fs from 'fs';

// TODO parallelize, use gulp file helpers
gulp.task('cache:content', done => {
  // Requiring at runtime because these files access `common`
  // code which in production works only if transpiled so after
  // gulp build:babel:common has run
  const {
    CONTENT_CACHE_PATH,
    getLocalizedContentResponse,
    IOS_FILTER,
    ANDROID_FILTER,
    buildFilterObject,
    hashForFilter,
  } = require('../website/server/libs/content'); // eslint-disable-line global-require
  const { langCodes } = require('../website/server/libs/i18n'); // eslint-disable-line global-require

  const iosHash = hashForFilter(IOS_FILTER);
  const iosFilterObj = buildFilterObject(IOS_FILTER);
  const androidHash = hashForFilter(ANDROID_FILTER);
  const androidFilterObj = buildFilterObject(ANDROID_FILTER);

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

      fs.writeFileSync(
        `${CONTENT_CACHE_PATH}${langCode}${iosHash}.json`,
        getLocalizedContentResponse(langCode, iosFilterObj),
        'utf8',
      );

      fs.writeFileSync(
        `${CONTENT_CACHE_PATH}${langCode}${androidHash}.json`,
        getLocalizedContentResponse(langCode, androidFilterObj),
        'utf8',
      );
    });
    done();
  } catch (err) {
    done(err);
  }
});

function safeMkdir (path) {
  try {
    fs.mkdirSync(path);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

gulp.task('cache:i18n', done => {
  // Requiring at runtime because these files access `common`
  // code which in production works only if transpiled so after
  // gulp build:babel:common has run
  const { BROWSER_SCRIPT_CACHE_PATH, geti18nCoreBrowserScript, geti18nContentBrowserScript } = require('../website/server/libs/i18n'); // eslint-disable-line global-require
  const { langCodes } = require('../website/server/libs/i18n'); // eslint-disable-line global-require

  try {
    // create the cache folders (if they doesn't exist)
    safeMkdir(BROWSER_SCRIPT_CACHE_PATH);
    safeMkdir(`${BROWSER_SCRIPT_CACHE_PATH}core/`);
    safeMkdir(`${BROWSER_SCRIPT_CACHE_PATH}content/`);

    // create and save the i18n browser script for each language
    langCodes.forEach(languageCode => {
      fs.writeFileSync(
        `${BROWSER_SCRIPT_CACHE_PATH}core/${languageCode}.js`,
        geti18nCoreBrowserScript(languageCode),
        'utf8',
      );
      fs.writeFileSync(
        `${BROWSER_SCRIPT_CACHE_PATH}content/${languageCode}.js`,
        geti18nContentBrowserScript(languageCode),
        'utf8',
      );
    });
    done();
  } catch (err) {
    done(err);
  }
});
