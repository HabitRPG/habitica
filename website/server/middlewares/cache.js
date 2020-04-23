import onHeaders from 'on-headers';
import packageInfo from '../../../package.json';

export function disableCache (req, res, next) {
  res.set('Cache-Control', 'no-store');

  // Remove the etag header when caching is disabled
  // @TODO Unfortunately it's not possible to prevent the creation right now
  // See this issue https://github.com/expressjs/express/issues/2472
  onHeaders(res, function removeEtag () {
    this.removeHeader('ETag');
  });

  return next();
}

export function cacheForAppVersion (req, res, next) {
  const appVersion = packageInfo.version;

  // If the app version is passed as a query parameter and matches the current package.json version
  // Enable caching
  if (req.query && req.query.appVersion === appVersion) {
    
  }

  return next();
}
