import nconf from 'nconf';
import {model as User} from '../models/user';

const IS_TEST_SERVER = nconf.get('IS_TEST_SERVER');

module.exports = function maintenanceMode (req, res, next) {
  if (IS_TEST_SERVER !== true) return next();
  const userId = req.header('x-api-user');

  return User.findOne({
    _id: userId,
  }, 'flags.isTrustedTestUser')
    .lean()
    .exec()
    .then((user) => {
      if (user && user.flags.isTrustedTestUser !== true) {
        return res.status(401).send({
          error: 'Not Authorized',
          message: 'Only test users are authorized',
        });
      }
      return next();
    })
    .catch(next);
};
