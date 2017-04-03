# Sanity Tests

## Babel Paths for Production Environment

In development, we [transpile at server start](https://github.com/HabitRPG/habitrpg/blob/1ed7e21542519abe7a3c601f396e1a07f9b050ae/website/server/index.js#L6-L8). This allows us to work quickly while developing, but is not suitable for production. So, in production we transpile the server code before the app starts.

This system means that requiring any files from `common/script` in `website/server/**/*.js` must be done through the `common/index.js` module. In development, it'll pass through to the pre-transpiled files, but in production it'll point to the transpiled versions. If you try to require or import a file directly, it will error in production as the server doesn't know what to do with some es2015isms (such as the import statement).

This test just verifies that none of the files in the server code are calling the common files directly.
