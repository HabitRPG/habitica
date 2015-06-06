import { pipe, awaitPort, kill }  from './taskHelper';
import { server as karma }        from 'karma';
import mongoose                   from 'mongoose';
import { exec }                   from 'child_process';
import psTree                     from 'ps-tree';
import gulp                       from 'gulp';
import Q                          from 'q';

const TEST_SERVER_PORT  = 3001
const TEST_DB           = 'habitrpg_test'

const TEST_DB_URI       = `mongodb://localhost/${TEST_DB}`

let testBin = (string) => {
  return `NODE_ENV=testing ./node_modules/.bin/${string}`;
};

gulp.task('test:prepare:mongo', (cb) => {
  mongoose.connect(TEST_DB_URI, () => {
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    cb();
  });
});

gulp.task('test:prepare:build', (cb) => {
  exec(testBin('grunt build:test'), cb);
});

gulp.task('test:prepare:webdriver', (cb) => {
  exec('./node_modules/protractor/bin/webdriver-manager update', cb);
});

gulp.task('test:prepare', [
  'test:prepare:build',
  'test:prepare:mongo',
  'test:prepare:webdriver'
]);

gulp.task('test:common', ['test:prepare'], (cb) => {
  let runner = exec(
    testBin('mocha test/common'), cb
  );
  pipe(runner);
});


gulp.task('test:api', ['test:prepare'], (cb) => {
  let runner = exec(
    testBin('mocha test/api'), cb
  );
  pipe(runner);
});

gulp.task('test:karma', ['test:prepare'], (cb) => {
  let runner = exec(
    testBin('karma start --single-run'), cb
  );
  pipe(runner);
});

gulp.task('test:e2e', ['test:prepare'], (cb) => {
  let support = [
    'Xvfb :99 -screen 0 1024x768x24 -extension RANDR',
    `NODE_DB_URI="${TEST_DB_URI}" PORT="${TEST_SERVER_PORT}" node ./website/src/server.js`,
    './node_modules/protractor/bin/webdriver-manager start',
  ].map(exec);

  Q.all([
    awaitPort(3001),
    awaitPort(4444)
  ]).then(() => {
    let runner = exec(
      'DISPLAY=:99 NODE_ENV=testing ./node_modules/protractor/bin/protractor protractor.conf.js',
      () => {
        support.forEach(kill);
        cb();
      }
    );
    pipe(runner);
  });
});

gulp.task('test', [
  'test:prepare',
  'test:common',
  'test:karma',
  'test:api',
  'test:e2e'
]);
