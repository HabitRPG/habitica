import AWS from 'aws-sdk';
import nconf from 'nconf';

export const S3 = new AWS.S3({ // eslint-disable-line import/prefer-default-export
  accessKeyId: nconf.get('S3_ACCESS_KEY_ID'),
  secretAccessKey: nconf.get('S3_SECRET_ACCESS_KEY'),
});
