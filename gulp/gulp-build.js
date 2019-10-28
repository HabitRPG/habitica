import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('build:src', () => gulp.src('website/server/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('website/transpiled-babel/')));

gulp.task('build:common', () => gulp.src('website/common/script/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('website/common/transpiled-babel/')));

gulp.task('build:server', gulp.series('build:src', 'build:common', done => done()));

gulp.task('build:prod', gulp.series(
  'build:server',
  'apidoc',
  done => done(),
));

const buildArgs = [];

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  buildArgs.push('build:prod');
}

gulp.task('build', gulp.series(buildArgs, done => {
  done();
}));
