/*
 * Note: You probably don't need to edit this file. Instead, add your gulp
 * tasks with the ./tasks directory, where tasks are grouped by their
 * particular purpose. If you feel like your task doesn't fit within the
 * existing files, feel free to create a "gulp-thing.js" file within that
 * directory, and it will automatically be included.
 */

/* eslint-disable import/no-commonjs */
require('@babel/register');

const gulp = require('gulp');

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  require('./gulp/gulp-apidoc'); // eslint-disable-line global-require
  require('./gulp/gulp-cache'); // eslint-disable-line global-require
  require('./gulp/gulp-build'); // eslint-disable-line global-require
} else {
  require('./gulp/gulp-apidoc'); // eslint-disable-line global-require
  require('./gulp/gulp-cache'); // eslint-disable-line global-require
  require('./gulp/gulp-build'); // eslint-disable-line global-require
  require('./gulp/gulp-console'); // eslint-disable-line global-require
  require('./gulp/gulp-sprites'); // eslint-disable-line global-require
  require('./gulp/gulp-start'); // eslint-disable-line global-require
  require('./gulp/gulp-tests'); // eslint-disable-line global-require
  require('./gulp/gulp-transifex-test'); // eslint-disable-line global-require
  require('gulp').task('default', gulp.series('test')); // eslint-disable-line global-require
}
