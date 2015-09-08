import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

let pkg = require('../package.json');
require('gulp-grunt')(gulp);

gulp.task('run:dev', ['nodemon', 'build:dev:watch']);

gulp.task('nodemon', () => {
  nodemon({
    script: pkg.main,
    ignore: ['website/public/*', 'website/views/*']
  });
});
