import onHeaders from 'on-headers';

export function disableCache (req, res, next) {
  res.header('Cache-Control', 'no-store');

  // Remove the etag header when caching is disabled
  // Unfortunately it's not possible to prevent the creation right now
  // See this issue https://github.com/expressjs/express/issues/2472
  onHeaders(res, function removeEtag () {
    this.removeHeader('ETag');
  });

  return next();
}
