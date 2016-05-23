var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var _ = require('lodash');
var manifestFiles = require("../../public/manifest.json");

var IS_PROD = nconf.get('NODE_ENV') === 'production';
var buildFiles = [];

var walk = function(folder){
  var res = fs.readdirSync(folder);

  res.forEach(function(fileName){
    var file = folder + '/' + fileName;
    if(fs.statSync(file).isDirectory()){
      walk(file);
    }else{
      var relFolder = path.relative(path.join(__dirname, "/../../build"), folder);
      var old = fileName.replace(/-.{8}(\.[\d\w]+)$/, '$1');

      if(relFolder){
        old = relFolder + '/' + old;
        fileName = relFolder + '/' + fileName;
      }

      buildFiles[old] = fileName;
    }
  });
};

walk(path.join(__dirname, "/../../build"));

var getBuildUrl = module.exports.getBuildUrl = function(url){
  if(buildFiles[url]) return '/' + buildFiles[url];

  return '/' + url;
};

module.exports.getManifestFiles = function(page){
  var files = manifestFiles[page];

  if(!files) throw new Error("Page not found!");

  var code = '';

  if(IS_PROD){
    code += '<link rel="stylesheet" type="text/css" href="' + getBuildUrl(page + '.css') + '">';
    code += '<script type="text/javascript" src="' + getBuildUrl(page + '.js') + '"></script>';
  }else{
    _.each(files.css, function(file){
      code += '<link rel="stylesheet" type="text/css" href="' + getBuildUrl(file) + '">';
    });
    _.each(files.js, function(file){
      code += '<script type="text/javascript" src="' + getBuildUrl(file) + '"></script>';
    });
  }

  return code;
};