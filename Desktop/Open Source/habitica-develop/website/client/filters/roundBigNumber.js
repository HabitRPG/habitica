import round from './round';

function _convertToThousand (num) {
  return `${(num / Math.pow(10, 3)).toFixed(1)}k`;
}

function _convertToMillion (num) {
  return `${(num / Math.pow(10, 6)).toFixed(1)}m`;
}

function _convertToBillion (num) {
  return `${(num / Math.pow(10, 9)).toFixed(1)}b`;
}

export default function roundBigNumber (num) {
  if (num > 999999999) {
    return _convertToBillion(num);
  } else if (num > 999999) {
    return _convertToMillion(num);
  } else if (num > 999) {
    return _convertToThousand(num);
  } else {
    return round(num);
  }
}