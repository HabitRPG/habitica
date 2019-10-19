import csvStringify from 'csv-stringify';

export default input => new Promise((resolve, reject) => {
  csvStringify(input, (err, output) => {
    if (err) return reject(err);
    return resolve(output);
  });
});
