// TODO verify if it's needed, added because Axios require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

// Automatically setup SinonJS' sandbox for each test
beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
});

afterEach(() => {
  global.sandbox.restore();
});

// require all test files
let testsContext = require.context('./specs', true, /\.js$/);
testsContext.keys().forEach(testsContext);

// require all .vue and .js files except main.js for coverage.
let srcContext = require.context('../../../website/client', true, /^\.\/(?=(?!main(\.js)?$))(?=(.*\.(vue|js)$))/);
srcContext.keys().forEach(srcContext);