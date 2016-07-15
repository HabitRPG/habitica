# How to run tests:

1. `npm test` is equivalent to `gulp test:api-v3` which will run, in order, `gulp lint`, `gulp test:api-v3:unit` and `gulp test:api-v3:integration`. If one of these fails, the whole `npm test` command blocks and fails.  Each of these commands can also be run as a standalone command. 
2. To run the server and the integrations tests in two different terminals (to better inspect the output in the server) run `npm start` in one and `npm test:api-v3:integration:separate-server` in the other
