# So you want to write API integration tests?

That's great! This README will serve as a quick primer for style conventions and practices for these tests.

## What is this?

These are integration tests for the Habitica API. They are performed by making HTTP requests to the API's endpoints and asserting on the data that is returned.

If the javascript looks weird to you, that's because it's written in [ES2015](http://www.ecma-international.org/ecma-262/6.0/) and transpiled by [Babel](https://babeljs.io/docs/learn-es2015/).

## How to run the tests

First, install gulp.

```bash
$ npm install -g gulp
```

To run the api tests, make sure the mongo db is up and running and then type this on the command line:

```bash
$ gulp test:api-v2
```

It may take a little while to get going, since it requires the web server to start up before the tests can run.

You can also run a watch command for the api tests. This will allow the tests to re-run automatically when you make changes in the `/test/api/v2/`.

```bash
$ gulp test:api-v2:watch
```

One caveat. If you have a severe syntax error in your files, the tests may fail to run, but they won't alert you that they are not running. If you ever find your test hanging for a while, run this to get the stackstrace. Once you've fixed the problem, you can resume running the watch comand.

```bash
$ gulp test:api:safe
```

If you'd like to run the tests individually and inspect the output from the server, in one pane you can run:

```bash
$ gulp test:nodemon
```

And run your tests in another pane:

```bash
$ mocha path/to/file.js

# Mark a test with the `.only` attribute
$ mocha
```

## Structure

Each top level route has it's own directory. So, all the routes that begin with `/groups/` live in `/test/api/groups/`.

Each test should:

  * encompase a single route
  * begin with the REST parameter for the route
  * display the full name of the route, swapping out `/` for `_`
  * end with test.js

So, for the `POST` route `/groups/:id/leave`, it would be

```bash
POST-groups_id_leave.test.js
```

## Promises

To mitigate [callback hell](http://callbackhell.com/) :imp:, we've written a helper method to generate a user object that can make http requests that [return promises](https://babeljs.io/docs/learn-es2015/#promises).  This makes it very easy to chain together commands. All you need to do to make a subsequent request is return another promise and then call `.then((result) => {})` on the surrounding block, like so:

```js
it('does something', () => { 
  let user;

  return generateUser().then((_user) => { // We return the initial promise so this test can be run asyncronously
    user = _user;

    return user.post('/groups', {
      type: 'party',
    });
  }).then((party) => { // the result of the promise above is the argument of the function
    return user.put(`/groups/${party._id}`, {
      name: 'My party',
    });
  }).then((result) => {
    return user.get('/groups/party');
  }).then((party) => {
    expect(party.name).to.eql('My party');
  });
});
```

If the test is simple, you can use the [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) `return expect(somePromise).to.eventually` syntax to make your assertion.

```js
it('makes the party creator the leader automatically', () => { 
  return expect(user.post('/groups', {
    type: 'party',
  })).to.eventually.have.deep.property('leader._id', user._id);
});
```

If the test is checking that the request returns an error, use the `.eventually.be.rejected.and.eql` syntax.

```js
it('returns an error', () => { 
  return expect(user.get('/groups/id-of-a-party-that-user-does-not-belong-to'))
    .to.eventually.be.rejected.and.eql({
      code: 404,
      text: t('messageGroupNotFound'),
    });
});
```

## Questions?

Ask in the [Aspiring Coder's Guild](https://habitica.com/#/options/groups/guilds/68d4a01e-db97-4786-8ee3-05d612c5af6f)!
