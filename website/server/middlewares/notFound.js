import {
  NotFound,
} from '../libs/errors';

module.exports = function NotFoundMiddleware (req, res, next) {
  next(new NotFound());
};
