import gulp from 'gulp';
import clean from 'rimraf';
import apidoc from 'apidoc';

const APIDOC_DEST_PATH = './apidoc/html';
const APIDOC_SRC_PATH = './website/server';
const APIDOC_CONFIG_PATH = './apidoc/apidoc.json';
gulp.task('apidoc:clean', done => {
  clean(APIDOC_DEST_PATH, done);
});

gulp.task('apidoc', gulp.series('apidoc:clean', done => {
  const result = apidoc.createDoc({
    src: APIDOC_SRC_PATH,
    dest: APIDOC_DEST_PATH,
    config: APIDOC_CONFIG_PATH,
  });

  if (result === false) {
    done(new Error('There was a problem generating apiDoc documentation.'));
  } else {
    done();
  }
}));

gulp.task('apidoc:watch', gulp.series('apidoc', done => gulp.watch(`${APIDOC_SRC_PATH}/**/*.js`, gulp.series('apidoc', done))));
