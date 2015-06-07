import { exec } from 'child_process';
import psTree   from 'ps-tree';
import net      from 'net';
import Q        from 'q';

/*
 * Kill a child process and any sub-children that process may have spawned.
 * This is necessary to ensure that Gulp will terminate when it has completed
 * its tasks.
 */
export function kill(proc) {
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
 * Return a promise that will execute when Node is able to connect on a
 * specific port. For example, this can be used to halt tasks until Selenium
 * has fully spun up. Optionally provide a maximum number of seconds to wait
 * before failing.
 */
export function awaitPort(port, max=60) {
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
 * Pipe the child's stdin and stderr to the parent process.
 */
export function pipe(child) {
  child.stdout.on('data', (data) => { process.stdout.write(data) });
  child.stderr.on('data', (data) => { process.stderr.write(data) });
};
