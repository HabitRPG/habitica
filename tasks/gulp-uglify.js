import gulp from 'gulp';
import fs from 'fs';

import {basename, dirname } from "./taskHelper.js";

let rename = require("gulp-rename");
let _ = require('lodash');
let uglify = require('gulp-uglify');
let merge = require('merge-stream');

gulp.task('uglify', () => {
  var files = JSON.parse(fs.readFileSync('./website/public/manifest.json'));
  var uglifyFiles = {};

  _.each(files, function(val, key) {
    var js = uglifyFiles['website/build/' + key + '.js'] = [];

    _.each(files[key].js, function(val){
      var path = "./";
      if( val.indexOf('common/') == -1)
        path = './website/public/';
      js.push(path + val);
    });
  });
  
  let streams = [];
  _.each(uglifyFiles, function(val, key) {
    let s = gulp.src(val)
      .pipe(uglify({
        compress: false
      }))
      .pipe(rename(basename(key)))
      .pipe(gulp.dest(dirname(key)));
    streams.push(s)
  });

  return merge.apply(this, streams);
});
