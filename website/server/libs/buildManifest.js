import fs from 'fs';
import path from 'path';
import nconf from 'nconf';

const MANIFEST_FILE_PATH = path.join(__dirname, '/../../client-old/manifest.json');
const BUILD_FOLDER_PATH = path.join(__dirname, '/../../build');
const manifestFiles = require(MANIFEST_FILE_PATH); // eslint-disable-line import/no-dynamic-require

const IS_PROD = nconf.get('IS_PROD');
const buildFiles = [];

function _walk (folder) {
  const files = fs.readdirSync(folder);

  files.forEach(fileName => {
    const file = `${folder}/${fileName}`;

    if (fs.statSync(file).isDirectory()) {
      _walk(file);
    } else {
      const relFolder = path.relative(BUILD_FOLDER_PATH, folder);
      let original = fileName.replace(/-.{8}(\.[\d\w]+)$/, '$1'); // Match the hash part of the filename

      if (relFolder) {
        original = `${relFolder}/${original}`;
        fileName = `${relFolder}/${fileName}`; // eslint-disable-line no-param-reassign
      }

      buildFiles[original] = fileName;
    }
  });
}

// Walks through all the files in the build directory
// and creates a map of original files names and hashed files names
_walk(BUILD_FOLDER_PATH);

export function getBuildUrl (url) {
  return `/${buildFiles[url] || url}`;
}

export function getManifestFiles (page, type) {
  const files = manifestFiles[page];

  if (!files) throw new Error(`Page "${page}" not found!`);

  let htmlCode = '';

  if (IS_PROD) {
    if (type !== 'js') {
      htmlCode += `<link rel="stylesheet" type="text/css" href="${getBuildUrl(page + '.css')}">`; // eslint-disable-line prefer-template
    }

    if (type !== 'css') {
      htmlCode += `<script type="text/javascript" src="${getBuildUrl(page + '.js')}"></script>`; // eslint-disable-line prefer-template
    }
  } else {
    if (type !== 'js') {
      files.css.forEach(file => {
        htmlCode += `<link rel="stylesheet" type="text/css" href="${getBuildUrl(file)}">`;
      });
    }

    if (type !== 'css') {
      files.js.forEach(file => {
        htmlCode += `<script type="text/javascript" src="${getBuildUrl(file)}"></script>`;
      });
    }
  }

  return htmlCode;
}
