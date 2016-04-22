// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function karmaConfig (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      'website/public/bower_components/jquery/dist/jquery.js',
      'website/public/bower_components/pnotify/jquery.pnotify.js',
      'website/public/bower_components/angular/angular.js',
      'website/public/bower_components/angular-loading-bar/build/loading-bar.min.js',
      'website/public/bower_components/angular-resource/angular-resource.min.js',
      'website/public/bower_components/hello/dist/hello.all.min.js',
      'website/public/bower_components/angular-sanitize/angular-sanitize.js',
      'website/public/bower_components/bootstrap/dist/js/bootstrap.js',
      'website/public/bower_components/angular-bootstrap/ui-bootstrap.js',
      'website/public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'website/public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'website/public/bower_components/angular-filter/dist/angular-filter.js',
      'website/public/bower_components/angular-ui/build/angular-ui.js',
      'website/public/bower_components/angular-ui-utils/ui-utils.min.js',
      'website/public/bower_components/Angular-At-Directive/src/at.js',
      'website/public/bower_components/Angular-At-Directive/src/caret.js',
      'website/public/bower_components/angular-mocks/angular-mocks.js',
      'website/public/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'website/public/bower_components/select2/select2.js',
      'website/public/bower_components/angular-ui-select2/src/select2.js',
      'website/public/bower_components/remarkable/dist/remarkable.min.js',
      'website/public/bower_components/js-emoji/emoji.js',
      'common/dist/scripts/habitrpg-shared.js',

      'test/spec/mocks/**/*.js',

      'website/public/js/env.js',
      'website/public/js/app.js',
      'common/script/public/config.js',
      'common/script/public/userServices.js',
      'common/script/public/directives.js',

      'website/public/js/services/**/*.js',
      'website/public/js/filters/**/*.js',
      'website/public/js/directives/**/*.js',
      'website/public/js/controllers/**/*.js',

      'test/spec/specHelper.js',
      'test/spec/**/*.js',
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
    browsers: ['PhantomJS'],

    preprocessors: {
      'website/public/js/**/*.js': ['coverage'],
      'test/**/*.js': ['babel'],
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/karma',
    },

    // Enable mocha-style reporting, for better test visibility
    reporters: ['mocha', 'coverage'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,
  });
};
