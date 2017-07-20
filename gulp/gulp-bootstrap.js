import gulp from 'gulp';
import fs from 'fs';

// Copy Bootstrap 4 config variables from /website /node_modules so we can check
// them into Git

const BOOSTRAP_NEW_CONFIG_PATH = 'website/client/assets/scss/bootstrap_config.scss';
const BOOTSTRAP_ORIGINAL_CONFIG_PATH = 'node_modules/bootstrap/scss/_custom.scss';

// https://stackoverflow.com/a/14387791/969528
function copyFile(source, target, cb) {
  let cbCalled = false;

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }

  let rd = fs.createReadStream(source);
  rd.on('error', done);
  let wr = fs.createWriteStream(target);
  wr.on('error', done);
  wr.on('close', () => done());
  rd.pipe(wr);
}

gulp.task('bootstrap', (done) => {
  // use new config
  copyFile(
    BOOSTRAP_NEW_CONFIG_PATH,
    BOOTSTRAP_ORIGINAL_CONFIG_PATH,
    done,
  );
});