import csvStringify from 'csv-stringify';
import Q from 'q';

export default function (input) {
  return Q.promise((resolve, reject) => {
    csvStringify(input, (err, output) => {
      if (err) return reject(err);
      return resolve(output);
    });
  });
}
