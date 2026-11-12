/* eslint-disable no-process-env */
import spawn from 'cross-spawn';

const args = process.argv.slice(2);
const isCI = Boolean(process.env.CI) && process.env.CI !== 'false';
const command = isCI ? args : ['nyc', '--silent', '--no-clean', ...args];

const child = spawn(command[0], command.slice(1), { stdio: 'inherit' });

child.on('error', err => {
  console.error(err.message); // eslint-disable-line no-console
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exitCode = code;
  }
});
