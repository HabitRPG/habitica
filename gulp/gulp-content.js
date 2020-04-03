import gulp from 'gulp';
import fs from 'fs';

// TODO parallelize, use gulp file helpers
gulp.task('content:cache', done => {
  // Requiring at runtime because these files access `common`
  // code which in production works only if transpiled so after
  // gulp build:babel:common has run
  const { CONTENT_CACHE_PATH, getLocalizedContent } = require('../website/server/libs/content'); // eslint-disable-line global-require
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
        getLocalizedContent(langCode),
        'utf8',
      );
    });
    done();
  } catch (err) {
    done(err);
  }
});
