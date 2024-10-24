// Equivalent of jQuery's param

export default function encodeParams (params) {
  return Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
}
