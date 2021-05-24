// Lang resolution (passed into replace)
const langRes = [
  // Strip beyond @ symbol to allow custom languages
  [/@(?:.+)$/, ''],
  // We use underscore, this mthd uses dash
  ['_', '-'],
];

// Lang resolution reducer
const langReduce = (str, params) => str.replace(...params);

export default function localizeNumber (valIn, lang, optIn = {}) {
  // Extra catch just incase non number
  const val = (typeof valIn === 'number') ? valIn : parseFloat(valIn);

  // Catch lang null
  const langCatch = (lang || []);

  // Options Management
  const { toFixed } = optIn;
  const optOut = {};
  if (typeof toFixed !== 'undefined') {
    optOut.maximumFractionDigits = toFixed;
    optOut.minimumFractionDigits = toFixed;
  }

  return val.toLocaleString(
    langCatch instanceof Array
      // Must use map with array
      ? langCatch.map(each => langRes.reduce(langReduce, each))
      // Parse to string as final backup
      : langRes.reduce(langReduce, langCatch.toString()),
    optOut,
  );
}
