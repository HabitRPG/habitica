import gulp from 'gulp';
require('gulp-grunt')(gulp);

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  } else {
    gulp.start('build:dev');
  }
});

gulp.task('build:dev', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  gulp.start('grunt-build:dev', done);
});

gulp.task('build:dev:watch', ['build:dev'], () => {
  gulp.watch(['website/public/**/*.styl', 'common/script/*']);
});

gulp.task('build:prod', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  gulp.start('grunt-build:prod', done);
});
