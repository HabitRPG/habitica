var chai = require("chai")
var expect = chai.expect

var fs = require('fs');
var _ = require('lodash');

var locales = './common/locales/';
var english = locales + 'en/';
var interpolationRegex = /<%= [a-zA-Z]* %>/g;

var languages = fs.readdirSync(locales);
languages.shift(); // Remove README.md from array of languages

var jsonFiles = stripOutNonJsonFiles(fs.readdirSync(english));
var stringsToLookFor = stringsWithInterpolations(jsonFiles);

_(languages).each(function(lang) {
  describe('the ' + lang + ' language', function() {

    _.each(stringsToLookFor, function(strings, file) {
      context('string in ' + file + ' -', function() {
        var translationFile = fs.readFileSync(locales + lang + '/' + file);
        var parsedTranslationFile = JSON.parse(translationFile);

        var englishFile = fs.readFileSync(english + file);
        var parsedEnglishFile = JSON.parse(englishFile);

        _.each(strings, function(value, key) {
          var englishString = parsedEnglishFile[key];
          var translationString = parsedTranslationFile[key];

          it(key + ' exists in ' + file + ' for the ' + lang + ' language', function() {
            expect(translationString).to.exist;
          });

          if(!translationString) return;

          var EnglishOccurences = englishString.match(interpolationRegex);
          var TranslationOccurences = translationString.match(interpolationRegex);

          it(key + ' - contains an interpolation', function() {

            if(!TranslationOccurences) console.log("English String:", englishString);
            expect(EnglishOccurences).to.exist;
            expect(TranslationOccurences).to.exist;
          });

          if(EnglishOccurences.length > 1) {
            xit(key + ' - has the correct number of interpolations', function() {
              if(!TranslationOccurences) console.log("English String:", englishString);
              var numberOfOccurences = TranslationOccurences && TranslationOccurences.length;
              expect(numberOfOccurences).to.eql(EnglishOccurences.length);
            });
          }
        });
      });
    });
  });
});

function stringsWithInterpolations(json) {
  var strings = {};

  _(json).each(function(file_name) {
    var raw_file = fs.readFileSync(english + file_name);
    var parsed_json = JSON.parse(raw_file);

    strings[file_name] = {};
    _.each(parsed_json, function(value, key) {
      var match = value.match(interpolationRegex);
      if(match) strings[file_name][key] = true;
    });
  });

  return strings;
}

function stripOutNonJsonFiles(collection) {
  var onlyJson = _.filter(collection, function(file) {
    return file.match(/[a-zA-Z]*\.json/);
  });

  return onlyJson;
}
