import csvStringify from 'csv-stringify';
import Q from 'q';

module.exports = (input) => {
  return Q.promise((resolve, reject) => {
    csvStringify(input, (err, output) => {
      if (err) return reject(err);
      return resolve(output);
    });
  });
};
