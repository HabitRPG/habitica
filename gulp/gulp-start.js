import gulp from 'gulp';
import nodemon from 'gulp-nodemon';

const pkg = require('../package.json');

gulp.task('nodemon', done => {
  nodemon({
    script: pkg.main,
    ignore: [
      'website/client-old/*',
      'website/views/*',
      'common/dist/script/content/*',
    ],
  });
  done();
});
