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

/* Helper methods for reporting test summary */
let testResults = [];
let testCount = (stdout, regexp) => {
  let match = stdout.match(regexp);
  return parseInt(match && match[1] || 0);
}

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

gulp.task('test:common', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin('mocha test/common'),
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'Common Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stderr, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/)
      });
      cb();
    }
  );
  pipe(runner);
});


gulp.task('test:api', ['test:prepare:mongo'], (cb) => {
  let runner = exec(
    testBin('mocha test/api'),
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'API Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stderr, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/)
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:karma', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin('karma start --single-run'),
    (err, stdout) => {
      testResults.push({
        suite: 'Karma Specs\t',
        pass: testCount(stdout, /(\d+) tests completed/),
        fail: testCount(stdout, /(\d+) tests failed/),
        pend: testCount(stdout, /(\d+) tests skipped/)
      });
      cb();
    }
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
      (err, stdout, stderr) => {
        /*
         * Note: As it stands, protractor wont report pending specs
         */
        let match = stdout.match(/(\d+) tests?.*(\d) failures?/);
        testResults.push({
          suite: 'End-to-End Specs',
          pass: parseInt(match[1]) - parseInt(match[2]),
          fail: parseInt(match[2]),
          pend: 0
        });
        support.forEach(kill);
        cb();
      }
    );
    pipe(runner);
  });
});

gulp.task('test', [
  'test:common',
  'test:karma',
  'test:api',
  'test:e2e'
], () => {
  let totals = [0,0,0];

  console.log('\n\x1b[36m\x1b[4mHabitica Test Summary\x1b[0m\n');
  testResults.forEach((s) => {
    totals[0] = totals[0] + s.pass;
    totals[1] = totals[1] + s.fail;
    totals[2] = totals[2] + s.pend;
    console.log(
      `\x1b[33m\x1b[4m${s.suite}\x1b[0m\t`,
      `\x1b[32mPassing: ${s.pass},\t`,
      `\x1b[31mFailed: ${s.fail},\t`,
      `\x1b[36mPending: ${s.pend}\t`
    );
  });

  console.log(
    '\n\x1b[33m\x1b[4mTotal:\x1b[0m\t\t\t',
    `\x1b[32mPassing: ${totals[0]},\t`,
    `\x1b[31mFailed: ${totals[1]},\t`,
    `\x1b[36mPending: ${totals[2]}\t`
  );

  console.log('\n\x1b[36mThanks for helping keep Habitica clean!\x1b[0m');
});
