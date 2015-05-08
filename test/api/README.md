# API Tests

Our API tests are written in [coffeescript](http://coffeescript.org/) using the [Mocha testing framework](http://mochajs.org/). You can run a file individually by running `mocha test/api/name_of_test.coffee`, all the api tests by running `mocha test/api`, or run them as part of the whole test suite with `npm test`.

### Modules

Some modules are declared in the [api-helper.coffee](api-helper.coffee) file for use in any of the api tests:

* `moment` - time manipulation
* `async` - run async processes, good for before blocks
* `lodash (_)` - many utilities
* `shared` - generate uuids
* `expect` - making assertions
* `User` - look up a User in the db

### Helper Methods

There are helper methods declared in the [api-helper.coffee](api-helper.coffee) file. Some useful methods contained there:

* `registerNewUser(callback, main)` - Theres a global user variable that gets overwritten with the new user whenever you call `registerNewUser` unless you pass false in as the second argument.
* `registerManyUsers(number, callback)` - Good for testing things that require many users. The callback function returns new users as and array in the second argument.
