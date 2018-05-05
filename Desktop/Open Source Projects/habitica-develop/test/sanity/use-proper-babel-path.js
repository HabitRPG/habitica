'use strict';

let glob = require('glob').sync;
let readFile = require('fs').readFileSync;

const IMPORT_REGEX = /(import|require).*common\/script/;

describe('Use Proper Babel Paths', () => {
  it('uses proper babel files in website/server', () => {
    let websiteServerPaths = glob('./website/server/**/*.js');

    if (websiteServerPaths.length === 0) {
      throw new Error('Could not find any files in website/server/**/*.js');
    }

    websiteServerPaths.forEach((filePath) => {
      let file = readFile(filePath, {encoding: 'utf8'});

      try {
        expect(file).to.not.match(IMPORT_REGEX);
      } catch (err) {
        // Nicer error reporting if this condition is violated
        throw new Error(`${filePath} contains an invalid import statement to common/script, which will work in development but fail in production. See README in this directory for more details.`);
      }
    });
  });
});
