import AWS from 'aws-sdk';
import nconf from 'nconf';

export const S3 = new AWS.S3({
  accessKeyId: nconf.get('S3_ACCESS_KEY_ID'),
  secretAccessKey: nconf.get('S3_SECRET_ACCESS_KEY'),
});
