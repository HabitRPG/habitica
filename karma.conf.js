// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-loading-bar/build/loading-bar.min.js',
      'public/bower_components/angular-resource/angular-resource.min.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
      'public/bower_components/marked/lib/marked.js',
      'public/bower_components/js-emoji/emoji.js',
      'public/bower_components/habitrpg-shared/dist/habitrpg-shared.js',
      'public/js/*.js',
      'public/js/**/*.js',
      'test/mock/**/*.js',
      'test/spec/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
