// TODO verify if it's needed, added because Vuex require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

// require all test files (files that ends with .spec.js)
var testsContext = require.context('./specs', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// require all .vue and .js files except main.js for coverage.
var srcContext = require.context('../../../website/client', true, /^\.\/(?=(?!main(\.js)?$))(?=(.*\.(vue|js)$))/);
srcContext.keys().forEach(srcContext);