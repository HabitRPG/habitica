// Equivalent of jQuery's param

export default function (params) {
  Object.keys(params).map((k) => {
    return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
  }).join('&');
}