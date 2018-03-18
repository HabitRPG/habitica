import csvStringify from 'csv-stringify';

module.exports = (input) => {
  return new Promise((resolve, reject) => {
    csvStringify(input, (err, output) => {
      if (err) return reject(err);
      return resolve(output);
    });
  });
};
