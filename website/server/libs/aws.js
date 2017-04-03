import AWS from 'aws-sdk';
import nconf from 'nconf';

export const S3 = new AWS.S3({
  accessKeyId: nconf.get('S3:accessKeyId'),
  secretAccessKey: nconf.get('S3:secretAccessKey'),
});
