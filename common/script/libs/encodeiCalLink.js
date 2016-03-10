/*
Encode the download link for .ics iCal file
 */

module.exports = function(uid, apiToken) {
  var loc, ref;
  loc = (typeof window !== "undefined" && window !== null ? window.location.host : void 0) || (typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.BASE_URL : void 0 : void 0) || '';
  return encodeURIComponent("http://" + loc + "/v1/users/" + uid + "/calendar.ics?apiToken=" + apiToken);
};
