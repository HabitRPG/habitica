/*
Silver amount from their money
 */

// TODO move to client

export default function silver (num) {
  if (num) {
    const centCount = Math.floor((num - Math.floor(num)) * 100);
    return `0${centCount}`.slice(-2);
  }
  return '00';
}
