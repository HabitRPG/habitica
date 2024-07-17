// eslint-disable-next-line import/no-commonjs, import/no-unresolved
const autocannon = require('autocannon');

autocannon({
  url: 'http://localhost:3000/api/v4/inbox/messages',
  method: 'GET',
  headers: {
    'x-api-user': 'd7ee6e45-7db1-44fd-8c1f-195ef6cd52d6',
    'x-api-key': '8a8f9790-a27b-4dff-b403-bddc5cf8fe53',
  },
  connections: 100, // default
  pipelining: 1, // default
  duration: 10, // default
  workers: 4,
}, console.log);
