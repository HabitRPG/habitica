/*
 * Note: You probably don't need to edit this file. Instead, add your gulp
 * tasks with the ./tasks directory, where tasks are grouped by their
 * particular purpose. If you feel like your task doesn't fit within the
 * existing files, feel free to create a "gulp-thing.js" file within that
 * directory, and it will automatically be included.
 */

require('babel-register');

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  require('./gulp/gulp-apidoc'); // eslint-disable-line global-require
  require('./gulp/gulp-build'); // eslint-disable-line global-require
} else {
  require('glob').sync('./gulp/gulp-*').forEach(require); // eslint-disable-line global-require
  require('gulp').task('default', ['test']); // eslint-disable-line global-require
}
