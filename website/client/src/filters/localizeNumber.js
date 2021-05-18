export default function localizeNumber (valIn, lang, optIn) {
  // Extra catch just incase non number
  const val = (typeof valIn === 'number') ? valIn : parseFloat(valIn);

  // Options Management
  const { toFixed } = optIn;
  const optOut = {};
  if (typeof toFixed !== 'undefined') {
    optOut.maximumFractionDigits = toFixed;
    optOut.minimumFractionDigits = toFixed;
  }

  return val.toLocaleString(
    // Catch null just incase
    (lang || [])
      // Strip beyond @ symbol to allow custom languages
      .replace(/@(?:.+)$/, '')
      // We use underscore, this mthd uses dash
      .replace('_', '-'),
    optOut,
  );
}
