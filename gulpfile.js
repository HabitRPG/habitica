var gulp      = require('gulp'),
    _         = require('lodash'),
    rimraf    = require('rimraf'),
    nodemon   = require('gulp-nodemon'),
    karma     = require('karma').server,
    stylus    = require('gulp-stylus'),
    nib       = require('nib'),
    minifycss = require('gulp-minify-css'),
    rename    = require('gulp-rename'),
    uglify    = require('gulp-uglify'),
    concat    = require('gulp-concat'),
    pkg       = require('./package');

var config = {
  stylus: {
     src: {
       app: 'public/css/index.styl',
       staticPage: 'public/css/static.styl' // static is a 'future' reserved word
     },
     dest: './build/'
  },
  sprite: {
    
  },
  copy: {
    src: ['./common/img/sprites/backer-only/*.gif', 
      './common/img/sprites/npc_ian.gif',
      './bower_components/bootstrap/dist/fonts/*'],
    dest: './build/'
  }
};

gulp.task('karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('git_changelog', function() {
  // @TODO: Finish this
});

gulp.task('clean', function(cb) {
  rimraf('./build', cb);
});

gulp.task('stylus', function() {
  gulp.src(config.stylus.src.app)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('app.css'))
    .pipe(gulp.dest(config.stylus.dest));
  gulp.src(config.stylus.src.staticPage)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('static.css'))
    .pipe(gulp.dest(config.stylus.dest));
});

gulp.task('copy', function() {
  gulp.src(config.copy.src)
    .pipe(gulp.dest(config.copy.dest));
});

gulp.task('hashres', function() {
  // @TODO: Finish this
});

gulp.task('watch', ['stylus'], function() {
  // @TODO: Finish this
});

gulp.task('dev', ['watch'], function() {
  // @TODO: Finish this
  nodemon({ script: pkg.main });
});

gulp.task('prod', ['clean', 'stylus', 'copy'], function() {
  // @TODO: Finish this
});
gulp.task('default', ['dev']);
