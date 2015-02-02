var gulp        = require('gulp'),
    _           = require('lodash'),
    browserify  = require('browserify'),
    coffeeify   = require('coffeeify'),
    source      = require('vinyl-source-stream');
    transform   = require('vinyl-transform'),
    rimraf      = require('rimraf'),
    nodemon     = require('gulp-nodemon'),
    karma       = require('karma').server,
    stylus      = require('gulp-stylus'),
    nib         = require('nib'),
    minifycss   = require('gulp-minify-css'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    pkg         = require('./package');

var paths = {
  stylus: {
     src: {
       app: './common/public/css/index.styl',
       staticPage: './common/public/css/static.styl' // static is a 'future' reserved word
     },
     dest: './build/'
  },
  common: {
    src: ['./common/index.js'],
    dest: './common/public/'
  },
  sprites: {
    src: 'img/sprites/spritesmith/**/*.png',
    dest: './common/public/sprites/'
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
  gulp.src(paths.stylus.src.app)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('app.css'))
    .pipe(gulp.dest(paths.stylus.dest));
  gulp.src(paths.stylus.src.staticPage)
    .pipe(stylus({use: [nib()]}))
    .pipe(rename('static.css'))
    .pipe(gulp.dest(paths.stylus.dest));
});

gulp.task('copy', function() {
  gulp.src(paths.copy.src)
    .pipe(gulp.dest(paths.copy.dest));
});

gulp.task('hashres', function() {
  // @TODO: Finish this
});

gulp.task('sprite', function() {
  // @TODO: Finish this
});

gulp.task('browserify', function() {
  var bundleStream = browserify(paths.common.src)
        .transform(coffeeify)
        .bundle()
 
  bundleStream
    .pipe(source('habitrpg-shared.js'))
    .pipe(gulp.dest(paths.common.dest))
})

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
