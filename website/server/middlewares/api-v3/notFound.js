import {
  NotFound,
} from '../../libs/api-v3/errors';

module.exports = function NotFoundMiddleware (req, res, next) {
  next(new NotFound());
};
