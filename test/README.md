We need to clean up this directory. The *real* tests are in spec/ mock/ e2e/ and api.mocha.coffee. We want to:

1. Move all old / deprecated tests from casper, test2, etc into spec, mock, e2e
1. Remove dependency of api.mocha.coffee on Derby, port it to Mongoose
1. Add better test-coverage
