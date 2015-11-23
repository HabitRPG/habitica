import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('build', () => {
  if (process.env.NODE_ENV === 'production') {
    gulp.start('build:prod');
  } else {
    gulp.start('build:dev');
  }
});

gulp.task('build:dev', ['babel:common', 'prepare:staticNewStuff'], (done) => {
  runSequence('browserify', 'stylus', 'cssmin:dev', () => {
    done();
  });
});

gulp.task('build:dev:watch', ['build:dev'], () => {
  gulp.watch(['website/public/**/*.styl', 'common/script/*']);
});

gulp.task('build:prod', ['prepare:staticNewStuff'], (done) => {
  runSequence('clean', 'browserify', 'uglify', 'cssmin:prod', 'stylus', 'copy', 'hashres', () => {
    done();
  });
});

