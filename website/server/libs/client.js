const ROOT = `${__dirname}/../../../`;

export function serveClient (expressRes) { // eslint-disable-line import/prefer-default-export
  return expressRes.sendFile('./dist-client/index.html', { root: ROOT });
}
