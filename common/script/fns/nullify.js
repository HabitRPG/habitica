// TODO remove once v2 is retired

module.exports = function nullify (user) {
  user.ops = null;
  user.fns = null;
  user = null;
};
