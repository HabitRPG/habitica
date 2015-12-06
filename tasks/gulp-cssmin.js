import gulp from 'gulp';
import fs from 'fs';

import {basename, dirname } from "./taskHelper.js";

let rename = require("gulp-rename");
let minifyCss = require('gulp-minify-css');
let _ = require('lodash');
let merge = require('merge-stream');

function doCssmin(files) {
  let streams = [];
  _.each(files, function(val, key) {
    let s = gulp.src(val)
      .pipe(minifyCss({compatibility: 'ie8'}))
      .pipe(rename(basename(key)))
      .pipe(gulp.dest(dirname(key)));
    streams.push(s);
  });
  return merge.apply(this, streams);
}

gulp.task('cssmin:dev', () => {
  return doCssmin({
    'common/dist/sprites/habitrpg-shared.css': ["common/dist/sprites/spritesmith*.css",
            "common/css/backer.css",
            "common/css/Mounts.css",
            "common/css/index.css"]
  });

});

gulp.task('cssmin:prod', () => {
  var files = JSON.parse(fs.readFileSync('./website/public/manifest.json'));
  var cssminFiles = {};

  _.each(files, function(val, key) {
    var css = cssminFiles['website/build/' + key + '.css'] = [];

    _.each(files[key].css, function(val){
      var path = "./";
      if( val.indexOf('common/') == -1) {
        path = (val == 'app.css' || val == 'static.css') ?  './website/build/' : './website/public/';
      }
      css.push(path + val)
    });
  
  });
  
  return doCssmin(cssminFiles);
});
