import fs from 'fs';
import path from 'path';
import nconf from 'nconf';

const MANIFEST_FILE_PATH = path.join(__dirname, '/../../client-old/manifest.json');
const BUILD_FOLDER_PATH = path.join(__dirname, '/../../build');
let manifestFiles = require(MANIFEST_FILE_PATH);

const IS_PROD = nconf.get('IS_PROD');
let buildFiles = [];

function _walk (folder) {
  let files = fs.readdirSync(folder);

  files.forEach((fileName) => {
    let file = `${folder}/${fileName}`;

    if (fs.statSync(file).isDirectory()) {
      _walk(file);
    } else {
      let relFolder = path.relative(BUILD_FOLDER_PATH, folder);
      let original = fileName.replace(/-.{8}(\.[\d\w]+)$/, '$1'); // Match the hash part of the filename

      if (relFolder) {
        original = `${relFolder}/${original}`;
        fileName = `${relFolder}/${fileName}`;
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
  let files = manifestFiles[page];

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
      files.css.forEach((file) => {
        htmlCode += `<link rel="stylesheet" type="text/css" href="${getBuildUrl(file)}">`;
      });
    }

    if (type !== 'css') {
      files.js.forEach((file) => {
        htmlCode += `<script type="text/javascript" src="${getBuildUrl(file)}"></script>`;
      });
    }
  }

  return htmlCode;
}
