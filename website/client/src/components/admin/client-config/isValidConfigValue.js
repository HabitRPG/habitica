export default function isValidConfigValue (type, value) {
  if (value === '' || value === null || value === undefined) return true;
  switch (type) {
    case 'number':
      return Number.isFinite(Number(value));
    case 'boolean':
      return typeof value === 'boolean';
    case 'json':
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return false;
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'url':
      try {
        return Boolean(new URL(value));
      } catch (e) {
        return false;
      }
    case 'date':
      return !Number.isNaN(Date.parse(value));
    default:
      return typeof value === 'string';
  }
}
