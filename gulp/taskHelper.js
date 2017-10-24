import { exec }                   from 'child_process';
import psTree                     from 'ps-tree';
import nconf                      from 'nconf';
import net                        from 'net';
import Bluebird                   from 'bluebird';
import { post }                   from 'superagent';
import { sync as glob }           from 'glob';
import Mocha                      from 'mocha';
import { resolve }                from 'path';

/*
 * Get access to configruable values
 */
nconf.argv().env().file({ file: 'config.json' });
export const conf = nconf;

/*
 * Kill a child process and any sub-children that process may have spawned.
 * This is necessary to ensure that Gulp will terminate when it has completed
 * its tasks.
 */
export function kill (proc) {
  let killProcess = (pid) => {
    psTree(pid, (_, pids) => {
      if (pids.length) {
        pids.forEach(kill); return;
      }
      try {
        exec(/^win/.test(process.platform) ?
          `taskkill /PID ${pid} /T /F` :
          `kill -9 ${pid}`);
      } catch (e) {
        console.log(e); // eslint-disable-line no-console
      }
    });
  };

  killProcess(proc.PID || proc.pid);
}

/*
 * Return a promise that will execute when Node is able to connect on a
 * specific port. For example, this can be used to halt tasks until Selenium
 * has fully spun up. Optionally provide a maximum number of seconds to wait
 * before failing.
 */
export function awaitPort (port, max = 60) {
  return new Bluebird((rej, res) => {
    let socket;
    let timeout;
    let interval;

    timeout = setTimeout(() => {
      clearInterval(interval);
      rej(`Timed out after ${max} seconds`);
    }, max * 1000);

    interval = setInterval(() => {
      socket = net.connect({port}, () => {
        clearInterval(interval);
        clearTimeout(timeout);
        socket.destroy();
        res();
      }).on('error', () => {
        socket.destroy();
      });
    }, 1000);
  });
}

/*
 * Pipe the child's stdin and stderr to the parent process.
 */
export function pipe (child) {
  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
}

/*
 * Post request to notify configured slack channel
 */
export function postToSlack (msg, config = {}) {
  let slackUrl = nconf.get('SLACK_URL');

  if (!slackUrl) {
    console.error('No slack post url specified. Your message was:'); // eslint-disable-line no-console
    console.log(msg); // eslint-disable-line no-console

    return;
  }

  post(slackUrl)
    .send({
      channel: `#${config.channel || '#general'}`,
      username: config.username || 'gulp task',
      text: msg,
      icon_emoji: `:${config.emoji || 'gulp'}:`, // eslint-disable-line camelcase
    })
    .end((err) => {
      if (err) console.error('Unable to post to slack', err); // eslint-disable-line no-console
    });
}

export function runMochaTests (files, server, cb) {
  require('../test/helpers/globals.helper'); // eslint-disable-line global-require

  let mocha = new Mocha({reporter: 'spec'});
  let tests = glob(files);

  tests.forEach((test) => {
    delete require.cache[resolve(test)];
    mocha.addFile(test);
  });

  mocha.run((numberOfFailures) => {
    if (!process.env.RUN_INTEGRATION_TEST_FOREVER) { // eslint-disable-line no-process-env
      if (server) kill(server);
      process.exit(numberOfFailures);
    }
    cb();
  });
}
