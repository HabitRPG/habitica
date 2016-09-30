import {
  pipe,
  awaitPort,
  kill,
  runMochaTests,
}  from './taskHelper';
import { server as karma }        from 'karma';
import mongoose                   from 'mongoose';
import { exec }                   from 'child_process';
import psTree                     from 'ps-tree';
import gulp                       from 'gulp';
import Bluebird                   from 'bluebird';
import runSequence                from 'run-sequence';
import os                         from 'os';
import nconf                      from 'nconf';

// TODO rewrite

const TEST_SERVER_PORT  = 3003;
let server;

const TEST_DB_URI       = nconf.get('TEST_DB_URI');

const API_V3_TEST_COMMAND = 'npm run test:api-v3';
const SANITY_TEST_COMMAND = 'npm run test:sanity';
const COMMON_TEST_COMMAND = 'npm run test:common';
const CONTENT_TEST_COMMAND = 'npm run test:content';
const CONTENT_OPTIONS = {maxBuffer: 1024 * 500};
const KARMA_TEST_COMMAND = 'npm run test:karma';

/* Helper methods for reporting test summary */
let testResults = [];
let testCount = (stdout, regexp) => {
  let match = stdout.match(regexp);
  return parseInt(match && match[1] || 0);
};

let testBin = (string, additionalEnvVariables = '') => {
  if (os.platform() === 'win32') {
    if (additionalEnvVariables != '') {
      additionalEnvVariables = additionalEnvVariables.split(' ').join('&&set ');
      additionalEnvVariables = 'set ' + additionalEnvVariables + '&&';
    }
    return `set NODE_ENV=test&&${additionalEnvVariables}${string}`;
  } else {
    return `NODE_ENV=test ${additionalEnvVariables} ${string}`;
  }
};

gulp.task('test:nodemon', (done) => {
  process.env.PORT = TEST_SERVER_PORT;
  process.env.NODE_DB_URI = TEST_DB_URI;

  runSequence('nodemon');
});

gulp.task('test:prepare:mongo', (cb) => {
  mongoose.connect(TEST_DB_URI, (err) => {
    if (err) return cb(`Unable to connect to mongo database. Are you sure it's running? \n\n${err}`);
    mongoose.connection.db.dropDatabase();
    mongoose.connection.close();
    cb();
  });
});

gulp.task('test:prepare:server', ['test:prepare:mongo'], () => {
  if (!server) {
    server = exec(testBin('node ./website/server/index.js', `NODE_DB_URI=${TEST_DB_URI} PORT=${TEST_SERVER_PORT}`), (error, stdout, stderr) => {
      if (error) { throw `Problem with the server: ${error}`; }
      if (stderr) { console.error(stderr); }
    });
  }
});

gulp.task('test:prepare:build', ['build'], (cb) => {
  exec(testBin('grunt build:test'), cb);
});

gulp.task('test:prepare:webdriver', (cb) => {
  exec('npm run test:prepare:webdriver', cb);
});

gulp.task('test:prepare', [
  'test:prepare:build',
  'test:prepare:mongo',
  'test:prepare:webdriver',
]);

gulp.task('test:sanity', (cb) => {
  let runner = exec(
    testBin(SANITY_TEST_COMMAND),
    (err, stdout, stderr) => {
      if (err) {
        process.exit(1);
      }
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:common', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(COMMON_TEST_COMMAND),
    (err, stdout, stderr) => {
      if (err) {
        process.exit(1);
      }
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:common:clean', (cb) => {
  pipe(exec(testBin(COMMON_TEST_COMMAND), () => cb()));
});

gulp.task('test:common:watch', ['test:common:clean'], () => {
  gulp.watch(['common/script/**/*', 'test/common/**/*'], ['test:common:clean']);
});

gulp.task('test:common:safe', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(COMMON_TEST_COMMAND),
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'Common Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/),
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:content', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(CONTENT_TEST_COMMAND),
    CONTENT_OPTIONS,
    (err, stdout, stderr) => {
      if (err) {
        process.exit(1);
      }
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:content:clean', (cb) => {
  pipe(exec(testBin(CONTENT_TEST_COMMAND), CONTENT_OPTIONS, () => cb()));
});

gulp.task('test:content:watch', ['test:content:clean'], () => {
  gulp.watch(['common/script/content/**', 'test/**'], ['test:content:clean']);
});

gulp.task('test:content:safe', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(CONTENT_TEST_COMMAND),
    CONTENT_OPTIONS,
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'Content Specs\t',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/),
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:karma', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(KARMA_TEST_COMMAND),
    (err, stdout) => {
      if (err) {
        process.exit(1);
      }
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:karma:watch', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(`${KARMA_TEST_COMMAND}:watch`),
    (err, stdout) => {
      cb(err);
    }
  );
  pipe(runner);
});

gulp.task('test:karma:safe', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(KARMA_TEST_COMMAND),
    (err, stdout) => {
      testResults.push({
        suite: 'Karma Specs\t',
        pass: testCount(stdout, /(\d+) tests? completed/),
        fail: testCount(stdout, /(\d+) tests? failed/),
        pend: testCount(stdout, /(\d+) tests? skipped/),
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:e2e', ['test:prepare', 'test:prepare:server'], (cb) => {
  let support = [
    'Xvfb :99 -screen 0 1024x768x24 -extension RANDR',
    testBin('npm run test:e2e:webdriver', 'DISPLAY=:99'),
  ].map(exec);
  support.push(server);

  Bluebird.all([
    awaitPort(TEST_SERVER_PORT),
    awaitPort(4444),
  ]).then(() => {
    let runner = exec(
      'npm run test:e2e',
      (err, stdout, stderr) => {
        support.forEach(kill);
        if (err) {
          process.exit(1);
        }
        cb();
      }
    );
    pipe(runner);
  });
});

gulp.task('test:e2e:safe', ['test:prepare', 'test:prepare:server'], (cb) => {
  let support = [
    'Xvfb :99 -screen 0 1024x768x24 -extension RANDR',
    'npm run test:e2e:webdriver',
  ].map(exec);

  Bluebird.all([
    awaitPort(TEST_SERVER_PORT),
    awaitPort(4444),
  ]).then(() => {
    let runner = exec(
      'npm run test:e2e',
      (err, stdout, stderr) => {
        let match = stdout.match(/(\d+) tests?.*(\d) failures?/);

        testResults.push({
          suite: 'End-to-End Specs\t',
          pass: testCount(stdout, /(\d+) passing/),
          fail: testCount(stdout, /(\d+) failing/),
          pend: testCount(stdout, /(\d+) pending/),
        });
        support.forEach(kill);
        cb();
      }
    );
    pipe(runner);
  });
});

gulp.task('test:api-v3:unit', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/unit --recursive'),
    (err, stdout, stderr) => {
      if (err) {
        process.exit(1);
      }
      done();
    }
  );

  pipe(runner);
});

gulp.task('test:api-v3:unit:watch', () => {
  gulp.watch(['website/server/libs/*', 'test/api/v3/unit/**/*', 'website/server/controllers/**/*'], ['test:api-v3:unit']);
});

gulp.task('test:api-v3:integration', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/integration --recursive'),
    {maxBuffer: 500 * 1024},
    (err, stdout, stderr) => {
      if (err) {
        process.exit(1);
      }
      done();
    }
  );

  pipe(runner);
});

gulp.task('test:api-v3:integration:watch', () => {
  gulp.watch(['website/server/controllers/api-v3/**/*', 'common/script/ops/*', 'website/server/libs/*.js',
              'test/api/v3/integration/**/*'], ['test:api-v3:integration']);
});

gulp.task('test:api-v3:integration:separate-server', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/integration --recursive', 'LOAD_SERVER=0'),
    {maxBuffer: 500 * 1024},
    (err, stdout, stderr) => done(err)
  );

  pipe(runner);
});

gulp.task('test', (done) => {
  runSequence(
    'test:sanity',
    'test:content',
    'test:common',
    'test:karma',
    'test:api-v3:unit',
    'test:api-v3:integration',
    done
  );
});

gulp.task('test:api-v3', (done) => {
  runSequence(
    'test:api-v3:unit',
    'test:api-v3:integration',
    done
  );
});
