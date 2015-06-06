import { exec } from 'child_process';
import psTree   from 'ps-tree';
import gulp     from 'gulp';
import net      from 'net';
import Q        from 'q';

const TEST_SERVER_PORT  = 3001
const TEST_DB           = 'habitrpg_test'

const TEST_DB_URI       = `mongodb://localhost/${TEST_DB}`

/*
 * This is a helper function that allows us to kill background tasks, such as
 * the Selenium webdriver. We need to recurse through any child processes they
 * have spun up, or gulp will hang after task completion.
 */
let kill = (proc) => {
  ((pid) => {
    psTree(pid, (_, pids) => {
      if(pids.length) {
        pids.forEach(kill); return
      }
      try {
        exec(/^win/.test(process.platform)
          ? `taskkill /PID ${pid} /T /F`
          : `kill -9 ${pid}`)
      }
      catch(e) { console.log(e) }
    });
  }(proc.PID || proc.pid));
};

/*
 * Another helper function, returns a promise that will resolve when a response
 * is received on the specified port. Accepts a second argument indicating the
 * maximum seconds to wait before failing.
 */
let awaitPort = (port, max = 60) => {
  let socket, timeout, interval;
  let deferred = Q.defer();

  timeout = setTimeout(() => {
    clearInterval(interval);
    deferred.reject(`Timed out after ${max} seconds`);
  }, max * 1000);

  interval = setInterval(() => {
    socket = net.connect({port: port}, () => {
      clearInterval(interval);
      clearTimeout(timeout);
      socket.destroy();
      deferred.resolve();
    }).on('error', () => { socket.destroy });
  }, 1000);

  return deferred.promise
};

/*
 * And another helper function to add "noisy" listeners (pipe child process
 * stdout and stderr to the parent.
 */
let listen = (child) => {
  child.stdout.on('data', (data) => { process.stdout.write(data) });
  child.stderr.on('data', (data) => { process.stderr.write(data) });
};

gulp.task('test:common', (cb) => {
  listen(exec('NODE_ENV=testing ./node_modules/.bin/mocha test/common', cb));
});

gulp.task('test:api', (cb) => {
  listen(exec('NODE_ENV=testing ./node_modules/.bin/mocha test/api', cb));
});

gulp.task('test:karma', (cb) => {
  listen(exec('NODE_ENV=testing ./node_modules/.bin/grunt karma:continuous', cb));
});

gulp.task('test:prepare:build', (cb) => {
  exec('grunt build:test', cb);
});

gulp.task('test:prepare:mongo', (cb) => {
  exec(`mongo "${TEST_DB}" --eval "db.dropDatabase()"`, cb);
});

gulp.task('test:prepare', [
  'test:prepare:build',
  'test:prepare:webdriver',
  'test:prepare:mongo'
]);

gulp.task('test:prepare:webdriver', (cb) => {
  exec('./node_modules/protractor/bin/webdriver-manager update', cb);
});

gulp.task('test:e2e', ['test:prepare'], (cb) => {
  let support = [
    'Xvfb :99 -screen 0 1024x768x24 -extension RANDR',
    `NODE_DB_URI="${TEST_DB_URI}" PORT="${TEST_SERVER_PORT}" node ./website/src/server.js`,
    './node_modules/protractor/bin/webdriver-manager start',
  ].map(exec);

  awaitPort(3001)
  .then(awaitPort.bind(null, 4444))
  .then(() => {
    listen(
      exec('DISPLAY=:99 NODE_ENV=testing ./node_modules/protractor/bin/protractor protractor.conf.js', () => {
        support.forEach(kill);
        cb();
      })
    );
  });

});

gulp.task('test', [
  'test:common',
  'test:api',
  'test:karma',
  'test:e2e'
]);

gulp.task('default', ['test']);
