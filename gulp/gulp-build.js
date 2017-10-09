import gulp from 'gulp';
import runSequence from 'run-sequence';
import babel from 'gulp-babel';
import webpackProductionBuild from '../webpack/build';

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  }
});

gulp.task('build:src', () => {
  return gulp.src('website/server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('website/transpiled-babel/'));
});

gulp.task('build:common', () => {
  return gulp.src('website/common/script/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('website/common/transpiled-babel/'));
});

gulp.task('build:server', ['build:src', 'build:common']);

// Client Production Build
gulp.task('build:client', ['bootstrap'], (done) => {
  webpackProductionBuild((err, output) => {
    if (err) return done(err);
    console.log(output);
  });
});

gulp.task('build:prod', [
  'build:server', 
  'build:client',
  'apidoc',
]);
