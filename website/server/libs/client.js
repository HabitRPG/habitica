const ROOT = `${__dirname}/../../../`;

export function serveClient (expressRes) {
  return expressRes.sendFile('./dist-client/index.html', {root: ROOT});
}