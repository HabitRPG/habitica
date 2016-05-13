import gulp from 'gulp';
import runSequence from 'run-sequence';
import babel from 'gulp-babel';
require('gulp-grunt')(gulp);

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  } else {
    gulp.start('build:dev');
  }
});

gulp.task('build:src', () => {
  return gulp.src('website/server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('website/transpiled-babel/'));
});

gulp.task('build:common', () => {
  return gulp.src('common/script/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('common/transpiled-babel/'));
});

gulp.task('build:server', ['build:src', 'build:common']);

gulp.task('build:dev', ['browserify', 'prepare:staticNewStuff'], (done) => {
  gulp.start('grunt-build:dev', done);
});

gulp.task('build:dev:watch', ['build:dev'], () => {
  gulp.watch(['website/client/**/*.styl', 'common/script/*']);
});

gulp.task('build:prod', ['browserify', 'build:server', 'prepare:staticNewStuff'], (done) => {
  runSequence(
    'grunt-build:prod',
    'apidoc',
    done
  );
});
