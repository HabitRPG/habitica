// Copied from https://github.com/rikmms/progress-bar-4-axios because that was declaring Axios 0.X as a dependency.
import axios from 'axios';
import NProgress from 'nprogress';

const calculatePercentage = (loaded, total) => (Math.floor(loaded * 1.0) / total);

export function loadProgressBar (config, instance = axios) {
  let requestsCounter = 0;

  const setupStartProgress = () => {
    instance.interceptors.request.use(requestConfig => {
      requestsCounter += 1;
      NProgress.start();
      return requestConfig;
    });
  };

  const setupUpdateProgress = () => {
    const update = e => NProgress.inc(calculatePercentage(e.loaded, e.total));
    instance.defaults.onDownloadProgress = update;
    instance.defaults.onUploadProgress = update;
  };

  const setupStopProgress = () => {
    const responseFunc = response => {
      requestsCounter -= 1;
      if (requestsCounter === 0) {
        NProgress.done();
      }
      return response;
    };

    const errorFunc = error => {
      requestsCounter -= 1;
      if (requestsCounter === 0) {
        NProgress.done();
      }
      return Promise.reject(error);
    };

    instance.interceptors.response.use(responseFunc, errorFunc);
  };

  NProgress.configure(config);
  setupStartProgress();
  setupUpdateProgress();
  setupStopProgress();
}

export default loadProgressBar;
