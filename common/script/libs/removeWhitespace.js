/*
Remove whitespace #FIXME are we using this anywwhere? Should we be?
 */

module.exports = function(str) {
  if (!str) {
    return '';
  }
  return str.replace(/\s/g, '');
};
