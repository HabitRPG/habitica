import gulp from 'gulp';
import fs from 'fs';

// Make semantic-ui-less work with a theme in a different folder
// Code taken from https://www.artembutusov.com/webpack-semantic-ui/

// Relative to node_modules/semantic-ui-less
const SEMANTIC_THEME_PATH = '../../website/client/assets/less/semantic-ui/theme.config';

// fix well known bug with default distribution
function fixFontPath (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, content) => {
      if (err) return reject(err);

      let newContent = content.replace(
        '@fontPath  : \'../../themes/',
        '@fontPath  : \'../../../themes/'
      );

      fs.writeFile(filename, newContent, 'utf8', (err1) => {
        if (err) return reject(err1);
        resolve();
      });
    });
  });
}

gulp.task('semantic-ui', (done) => {
  // relocate default config
  fs.writeFile(
    'node_modules/semantic-ui-less/theme.config',
    `@import '${SEMANTIC_THEME_PATH}';\n`,
    'utf8',
    (err) => {
      if (err) return done(err);

      fixFontPath('node_modules/semantic-ui-less/themes/default/globals/site.variables')
        .then(() => done())
        .catch(done);
    }
  );
});