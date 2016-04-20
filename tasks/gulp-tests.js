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
import Q                          from 'q';
import runSequence                from 'run-sequence';
import os                         from 'os';
import nconf                      from 'nconf';

// TODO rewrite

const TEST_SERVER_PORT  = 3003
let server;

const TEST_DB_URI       = nconf.get('TEST_DB_URI');

const API_V2_TEST_COMMAND = 'npm run test:api-v2:integration';
const API_V3_TEST_COMMAND = 'npm run test:api-v3';
const LEGACY_API_TEST_COMMAND = 'npm run test:api-legacy';
const COMMON_TEST_COMMAND = 'npm run test:common';
const CONTENT_TEST_COMMAND = 'npm run test:content';
const CONTENT_OPTIONS = {maxBuffer: 1024 * 500};
const KARMA_TEST_COMMAND = 'npm run test:karma';
const SERVER_SIDE_TEST_COMMAND = 'npm run test:api-v2:unit';
const ISTANBUL_TEST_COMMAND = 'npm run test:api-legacy';

/* Helper methods for reporting test summary */
let testResults = [];
let testCount = (stdout, regexp) => {
  let match = stdout.match(regexp);
  return parseInt(match && match[1] || 0);
}

let testBin = (string, additionalEnvVariables = '') => {
  if(os.platform() === "win32") {
    if(additionalEnvVariables != '') {
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
  process.env.NODE_DB_URI=TEST_DB_URI;

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
    server = exec(testBin(`node ./website/src/index.js`, `NODE_DB_URI=${TEST_DB_URI} PORT=${TEST_SERVER_PORT}`), (error, stdout, stderr) => {
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
  'test:prepare:webdriver'
]);

gulp.task('test:common', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(COMMON_TEST_COMMAND),
    (err, stdout, stderr) => {
    	cb(err);
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
        pend: testCount(stdout, /(\d+) pending/)
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
    	cb(err);
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
        pend: testCount(stdout, /(\d+) pending/)
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:server_side', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(SERVER_SIDE_TEST_COMMAND),
    (err, stdout, stderr) => {
    	cb(err);
    }
  );
  pipe(runner);
});

gulp.task('test:server_side:safe', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(SERVER_SIDE_TEST_COMMAND),
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'Server Side Specs',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/)
      });
      cb();
    }
  );
  pipe(runner);
});

gulp.task('test:api-legacy', ['test:prepare:mongo'], (cb) => {
  let runner = exec(
    testBin(ISTANBUL_TEST_COMMAND),
    (err, stdout, stderr) => {
      cb(err);
    }
  );
  pipe(runner);
});

gulp.task('test:api-legacy:safe', ['test:prepare:mongo'], (cb) => {
  let runner = exec(
    testBin(ISTANBUL_TEST_COMMAND),
    (err, stdout, stderr) => {
      testResults.push({
        suite: 'API (legacy) Specs',
        pass: testCount(stdout, /(\d+) passing/),
        fail: testCount(stdout, /(\d+) failing/),
        pend: testCount(stdout, /(\d+) pending/)
      });
	  cb();
    }
  );
  pipe(runner);
});

gulp.task('test:api-legacy:clean', (cb) => {
  pipe(exec(testBin(LEGACY_API_TEST_COMMAND), () => cb()));
});

gulp.task('test:api-legacy:watch', [
  'test:prepare:mongo',
  'test:api-legacy:clean'
], () => {
  gulp.watch(['website/src/**', 'test/api-legacy/**'], ['test:api-legacy:clean']);
});

gulp.task('test:karma', ['test:prepare:build'], (cb) => {
  let runner = exec(
    testBin(KARMA_TEST_COMMAND),
    (err, stdout) => {
    	cb(err);
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
        pend: testCount(stdout, /(\d+) tests? skipped/)
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

  Q.all([
    awaitPort(TEST_SERVER_PORT),
    awaitPort(4444)
  ]).then(() => {
    let runner = exec(
      'npm run test:e2e',
      (err, stdout, stderr) => {
        support.forEach(kill);
        cb(err);
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

  Q.all([
    awaitPort(TEST_SERVER_PORT),
    awaitPort(4444)
  ]).then(() => {
    let runner = exec(
      'npm run test:e2e',
      (err, stdout, stderr) => {
        let match = stdout.match(/(\d+) tests?.*(\d) failures?/);

        testResults.push({
          suite: 'End-to-End Specs\t',
          pass: testCount(stdout, /(\d+) passing/),
          fail: testCount(stdout, /(\d+) failing/),
          pend: testCount(stdout, /(\d+) pending/)
        });
        support.forEach(kill);
        cb();
      }
    );
    pipe(runner);
  });
});

/*gulp.task('test:api-v2', ['test:prepare:server'], (done) => {
  process.env.API_VERSION = 'v2';
  awaitPort(TEST_SERVER_PORT).then(() => {
    runMochaTests('./test/api/v2/**//*.js', server, done)
  });
});

gulp.task('test:api-v2:watch', ['test:prepare:server'], () => {
  process.env.RUN_INTEGRATION_TEST_FOREVER = true;
  gulp.watch(['website/src/**', 'test/api/v2/**'], ['test:api-v2']);
});

gulp.task('test:api-v2:safe', ['test:prepare:server'], (done) => {
  awaitPort(TEST_SERVER_PORT).then(() => {
    let runner = exec(
      testBin(API_V2_TEST_COMMAND),
      (err, stdout, stderr) => {
        testResults.push({
          suite: 'API V2 Specs\t',
          pass: testCount(stdout, /(\d+) passing/),
          fail: testCount(stderr, /(\d+) failing/),
          pend: testCount(stdout, /(\d+) pending/)
        });
        done();
      }
    );
    pipe(runner);
  });
});*/

gulp.task('test:api-v2:integration', (done) => {
  let runner = exec(
    testBin('mocha test/api/v2 --recursive'),
    {maxBuffer: 500*1024},
    (err, stdout, stderr) => done(err)
  )

  pipe(runner);
});

gulp.task('test:api-v3:unit', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/unit --recursive'),
    (err, stdout, stderr) => done(err)
  )

  pipe(runner);
});

gulp.task('test:api-v3:unit:watch', () => {
  gulp.watch(['website/src/libs/api-v3/*', 'test/api/v3/unit/libs/*', 'website/src/controllers/**/*'], ['test:api-v3:unit']);
});

gulp.task('test:api-v3:integration', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/integration --recursive'),
    {maxBuffer: 500*1024},
    (err, stdout, stderr) => done(err)
  )

  pipe(runner);
});

gulp.task('test:api-v3:integration:watch', () => {
  gulp.watch(['website/src/controllers/api-v3/**/*', 'test/api/v3/integration/**/*', 'common/script/ops/*'], ['test:api-v3:integration']);
});

gulp.task('test:api-v3:integration:separate-server', (done) => {
  let runner = exec(
    testBin('mocha test/api/v3/integration --recursive', 'LOAD_SERVER=0'),
    {maxBuffer: 500*1024},
    (err, stdout, stderr) => done(err)
  )

  pipe(runner);
});

gulp.task('test', (done) => {
  runSequence(
    'test:common',
    'test:api-v3:unit',
    'test:api-v3:integration',
    'test:api-v2:integration',
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

// Old tests tasks
/*
gulp.task('test:api-v3', ['test:api-v3:unit', 'test:api-v3:integration']);

gulp.task('test:api-v3:watch', ['test:api-v3:unit:watch', 'test:api-v3:integration:watch']);

gulp.task('test:api-v3:unit', (done) => {*/
//  runMochaTests('./test/api/v3/unit/**/*.js', null, done)
/*});

gulp.task('test:api-v3:unit:watch', () => {
  gulp.watch(['website/src/**', 'test/api/v3/unit/**'], ['test:api-v3:unit']);
});

gulp.task('test:api-v3:integration', ['test:prepare:server'], (done) => {
  process.env.API_VERSION = 'v3';
  awaitPort(TEST_SERVER_PORT).then(() => {*/
//    runMochaTests('./test/api/v3/integration/**/*.js', server, done)
/*  });
});

gulp.task('test:api-v3:integration:watch', ['test:prepare:server'], () => {
  process.env.RUN_INTEGRATION_TEST_FOREVER = true;
  gulp.watch(['website/src/**', 'test/api/v3/integration/**'], ['test:api-v3:integration']);
});

gulp.task('test:api-v3:safe', ['test:prepare:server'], (done) => {
  awaitPort(TEST_SERVER_PORT).then(() => {
    let runner = exec(
      testBin(API_V3_TEST_COMMAND),
      (err, stdout, stderr) => {
        testResults.push({
          suite: 'API V3 Specs\t',
          pass: testCount(stdout, /(\d+) passing/),
          fail: testCount(stdout, /(\d+) failing/),
          pend: testCount(stdout, /(\d+) pending/)
        });
        done();
      }
    );
    pipe(runner);
  });
});

gulp.task('test:all', (done) => {
  runSequence(
  //'test:e2e:safe',
  //'test:common:safe',
  //'test:content:safe',
  // 'test:server_side:safe',
  //'test:karma:safe',
  //'test:api-legacy:safe',
  //'test:api-v2:safe',
  'test:api-v3:safe',
  done);
});

gulp.task('test', ['test:all'], () => {
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

    if (s.pass === 0) {
      console.error('ERROR: Detected a test suite with 0 passing tests. Something may be wrong causing the build to error.');
      process.exit(1);
    }
  });

  console.log(
    '\n\x1b[33m\x1b[4mTotal:\x1b[0m\t\t\t',
    `\x1b[32mPassing: ${totals[0]},\t`,
    `\x1b[31mFailed: ${totals[1]},\t`,
    `\x1b[36mPending: ${totals[2]}\t`
  );

  kill(server);

  if (totals[1] > 0) {
    console.error('ERROR: There are failing tests!');
    process.exit(1);
  } else {
    console.log('\n\x1b[36mThanks for helping keep Habitica clean!\x1b[0m');
    process.exit();
  }
});*/
