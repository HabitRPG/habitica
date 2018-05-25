import csvStringify from 'csv-stringify';
import Bluebird from 'bluebird';

module.exports = (input) => {
  return new Bluebird((resolve, reject) => {
    csvStringify(input, (err, output) => {
      if (err) return reject(err);
      return resolve(output);
    });
  });
};
