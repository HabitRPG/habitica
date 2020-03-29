import gulp from 'gulp';
import fs from 'fs';
import clean from 'rimraf';
import { CONTENT_CACHE_PATH, getLocalizedContent } from '../website/server/libs/content';
import { langCodes } from '../website/server/libs/i18n';

gulp.task('content:cache:clean', done => {
  clean(CONTENT_CACHE_PATH, done);
});

// TODO parallelize, use gulp file helpers
gulp.task('content:cache', gulp.series('content:cache:clean', done => {
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
}));
