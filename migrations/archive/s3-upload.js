/* eslint-disable import/no-commonjs */
const request = require('superagent');
const last = require('lodash/last');
const AWS = require('aws-sdk');

const config = require('../config');

const S3_DIRECTORY = 'mobileApp/images'; // config.S3.SPRITES_DIRECTORY;

AWS.config.update({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
  // region: config.get('S3_REGION'),
});

const BUCKET_NAME = config.S3.bucket;
const s3 = new AWS.S3();

// Adapted from https://stackoverflow.com/a/22210077/2601552
function uploadFile (buffer, fileName) {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Body: buffer,
      Key: fileName,
      Bucket: BUCKET_NAME,
    }, error => {
      if (error) {
        reject(error);
      } else {
        // console.info(`${fileName} uploaded to ${BUCKET_NAME} successfully.`);
        resolve(fileName);
      }
    });
  });
}

function getFileName (file) {
  const piecesOfPath = file.split('/');
  const name = last(piecesOfPath);
  const fullName = S3_DIRECTORY + name;

  return fullName;
}

function getFileFromUrl (url) {
  return new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      if (err) return reject(err);
      const file = res.body;
      return resolve(file);
    });
  });
}

let commit = '78f94e365c72cc58f66857d5941105638db7d35c';
commit = 'df0dbaba636c9ce424cc7040f7bd7fc1aa311015';
const gihuburl = `https://api.github.com/repos/HabitRPG/habitica/commits/${commit}`;


let currentIndex = 0;

function uploadToS3 (start, end, filesUrls) {
  const urls = filesUrls.slice(start, end);

  if (urls.length === 0) {
    console.log('done');
    return;
  }

  const promises = urls.map(fullUrl => getFileFromUrl(fullUrl)
    .then(buffer => uploadFile(buffer, getFileName(fullUrl))));
  console.log(promises.length);

  Promise.all(promises)
    .then(() => {
      currentIndex += 50;
      uploadToS3(currentIndex, currentIndex + 50, filesUrls);
    })
    .catch(e => {
      console.log(e);
    });
}

request.get(gihuburl)
  .end((err, res) => {
    console.log(err);
    const { files } = res.body;

    let filesUrls = [''];
    filesUrls = files.map(file => file.raw_url);

    uploadToS3(currentIndex, currentIndex + 50, filesUrls);
  });
