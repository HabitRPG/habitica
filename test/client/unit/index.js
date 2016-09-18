// require all test files (files that ends with .spec.js)
var testsContext = require.context('./specs', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// require all src files except main.js/ README.md / index.html for coverage.
var srcContext = require.context('../../../website/client', true, /^\.\/(?!(main\.js|README\.md|index\.html)?$)/);
srcContext.keys().forEach(srcContext);
