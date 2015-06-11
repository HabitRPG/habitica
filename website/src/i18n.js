var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    User = require('./models/user').model,
    shared = require('../../common'),
    translations = {};

var localePath = path.join(__dirname, "/../../common/locales/")

var loadTranslations = function(locale){
  var files = fs.readdirSync(path.join(localePath, locale));
  translations[locale] = {};
  _.each(files, function(file){
    if(path.extname(file) !== '.json') return;
    _.merge(translations[locale], require(path.join(localePath, locale, file)));
  });
};

// First fetch english so we can merge with missing strings in other languages
loadTranslations('en');

fs.readdirSync(localePath).forEach(function(file) {
  if(file === 'en' || fs.statSync(path.join(localePath, file)).isDirectory() === false) return;
  loadTranslations(file);
  // Merge missing strings from english
  _.defaults(translations[file], translations.en);
});

var langCodes = Object.keys(translations);

var avalaibleLanguages = _.map(langCodes, function(langCode){
  return {
    code: langCode,
    name: translations[langCode].languageName
  }
});

// Load MomentJS localization files
var momentLangs = {};

// Handle different language codes from MomentJS and /locales
var momentLangsMapping = {
  'en': 'en-gb',
  'en_GB': 'en-gb',
  'no': 'nn',
  'zh': 'zh-cn',
  'es_419': 'es'
};

var momentLangs = {};

_.each(langCodes, function(code){
  var lang = _.find(avalaibleLanguages, {code: code});
  lang.momentLangCode = (momentLangsMapping[code] || code);
  try{
    // MomentJS lang files are JS files that has to be executed in the browser so we load them as plain text files
    var f = fs.readFileSync(path.join(__dirname, '/../../node_modules/moment/locale/' + lang.momentLangCode + '.js'), 'utf8');
    momentLangs[code] = f;
  }catch (e){}
});

// Remove en_GB from langCodes checked by browser to avaoi it being 
// used in place of plain original 'en'
var defaultLangCodes = _.without(langCodes, 'en_GB');

// A list of languages that have different versions
var multipleVersionsLanguages = ['es', 'zh'];

var latinAmericanSpanishes = ['es-419', 'es-mx', 'es-gt', 'es-cr', 'es-pa', 'es-do', 'es-ve', 'es-co', 'es-pe',
                            'es-ar', 'es-ec', 'es-cl', 'es-uy', 'es-py', 'es-bo', 'es-sv', 'es-hn',
                            'es-ni', 'es-pr'];

var chineseVersions = ['zh-tw'];

var getUserLanguage = function(req, res, next){
  var getFromBrowser = function(){
    var acceptable = _(req.acceptedLanguages).map(function(lang){
      return lang.slice(0, 2);
    }).uniq().value();

    var matches = _.intersection(acceptable, defaultLangCodes);

    var iAcceptedCompleteLang = (matches.length > 0) ? multipleVersionsLanguages.indexOf(matches[0].toLowerCase()) : -1;

    if(iAcceptedCompleteLang !== -1){
      var acceptedCompleteLang = _.find(req.acceptedLanguages, function(accepted){
        return accepted.slice(0, 2) == multipleVersionsLanguages[iAcceptedCompleteLang];
      });

      if(acceptedCompleteLang){
        acceptedCompleteLang = acceptedCompleteLang.toLowerCase();
      }else{
        return 'en';
      }

      if(matches[0] === 'es'){
        return (latinAmericanSpanishes.indexOf(acceptedCompleteLang) !== -1) ? 'es_419' : 'es';
      }else if(matches[0] === 'zh'){
        var iChinese = chineseVersions.indexOf(acceptedCompleteLang.toLowerCase());
        return (iChinese !== -1) ? chineseVersions[iChinese] : 'zh';
      }else{
        return en;
      }

    }else if(matches.length > 0){
      return matches[0].toLowerCase();
    }else{
      return 'en';
    }
  };

  var getFromUser = function(user){
    var lang;
    if(user && user.preferences.language && translations[user.preferences.language]){
      lang = user.preferences.language;
    }else{
      var preferred = getFromBrowser();
      lang = translations[preferred] ? preferred : 'en';
    }
    req.language = lang;
    next();
  };

  if(req.query.lang){
    req.language = translations[req.query.lang] ? (req.query.lang) : 'en';
    next();
  }else if(req.locals && req.locals.user){
    getFromUser(req.locals.user);
  }else if(req.session && req.session.userId){
    User.findOne({_id: req.session.userId}, 'preferences.language', function(err, user){
      if(err) return next(err);
      getFromUser(user);
    });
  }else{
    getFromUser(null);
  }
};

shared.i18n.translations = translations;

module.exports = {
  translations: translations,
  avalaibleLanguages: avalaibleLanguages,
  langCodes: langCodes,
  getUserLanguage: getUserLanguage,
  momentLangs: momentLangs
};


// Export en strings only, temporary solution for mobile
// This is copied from middleware.js#module.exports.locals#t()
module.exports.enTranslations = function(){ // stringName and vars are the allowed parameters
  var language = _.find(avalaibleLanguages, {code: 'en'});
  //language.momentLang = ((!isStaticPage && i18n.momentLangs[language.code]) || undefined);
  var args = Array.prototype.slice.call(arguments, 0);
  args.push(language.code);
  return shared.i18n.t.apply(null, args);
};
