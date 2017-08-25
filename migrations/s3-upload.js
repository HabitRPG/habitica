let Bluebird = require('bluebird');
let request = require('superagent');
let last = require('lodash/last');
let AWS = require('aws-sdk');

let config = require('../config');
const S3_DIRECTORY = ''; //config.S3.SPRITES_DIRECTORY;

AWS.config.update({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
  // region: config.get('S3_REGION'),
});

let BUCKET_NAME = config.S3.bucket;
let s3 = new AWS.S3();

// Adapted from http://stackoverflow.com/a/22210077/2601552
function uploadFile (buffer, fileName) {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Body: buffer,
      Key: fileName,
      Bucket: BUCKET_NAME,
    }, (error) => {
      if (error) {
        reject(error);
      } else {
        console.info(`${fileName} uploaded to ${BUCKET_NAME} succesfully.`);
        resolve(fileName);
      }
    });
  });
}

function getFileName (file) {
  let piecesOfPath = file.split('/');
  let name = last(piecesOfPath);
  let fullName = S3_DIRECTORY + name;

  return fullName;
}

function getFileFromUrl (url) {
  return new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      if (err) return reject(err);
      let file = res.body;
      resolve(file);
    });
  });
}

// Example of url format
let filesUrls = ['https://storage.googleapis.com/gweb-uniblog-publish-prod/static/blog/images/google-200x200.7714256da16f.png'];
let promises = filesUrls.map(fullUrl => {
  return getFileFromUrl(fullUrl)
  .then((buffer) => {
    return uploadFile(buffer, getFileName(fullUrl));
  });
});

Bluebird.all(promises)
  .then(() => {
    console.log("done");
  })
  .catch(e => {
    console.log(e);
  });
