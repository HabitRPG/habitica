import {
  NotFound,
} from '../../libs/api-v3/errors';

export default function (req, res, next) {
  next(new NotFound());
}
