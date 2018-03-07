import gulp from 'gulp';
import babel from 'gulp-babel';
import webpackProductionBuild from '../webpack/build';

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

gulp.task('build:server', gulp.series('build:src', 'build:common', done => done()));

// Client Production Build
gulp.task('build:client', (done) => {
  webpackProductionBuild((err, output) => {
    if (err) return done(err);
    console.log(output); // eslint-disable-line no-console
    done();
  });
});

gulp.task('build:prod', gulp.series(
  'build:server',
  'build:client',
  'apidoc',
  done => done()
));

let buildArgs = [];

if (process.env.NODE_ENV === 'production') { // eslint-disable-line no-process-env
  buildArgs.push('build:prod');
}

gulp.task('build', gulp.series(buildArgs, (done) => {
  done();
}));