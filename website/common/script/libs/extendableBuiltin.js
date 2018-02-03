// Babel 6 doesn't support extending native class (Error, Array, ...)
// This function makes it possible to extend native classes with the same results as Babel 5
module.exports = function extendableBuiltin (klass) {
  function ExtendableBuiltin () {
    klass.apply(this, arguments);
  }
  ExtendableBuiltin.prototype = Object.create(klass.prototype);
  Object.setPrototypeOf(ExtendableBuiltin, klass);

  return ExtendableBuiltin;
};
