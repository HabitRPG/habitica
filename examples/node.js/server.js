var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    baseUrl:'', //relative to this file
    paths: { //relative to baseUrl
        cs: 'requirejs/cs', //plugin to use coffee-script to parse file first.
        'coffee-script': 'coffee-script'
    }
});

requirejs(['cs!./app/module'],
    function   (module) {
      module.foo('Hello!');
    });