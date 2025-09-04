import { param , validationResult } from 'express-validator';
import { model as Coupon } from '../../models/coupon';

export async function enterCode (req, res, user) { // eslint-disable-line import/prefer-default-export, max-len
  await param('code', res.t('couponCodeRequired')).notEmpty().run(req)

  const validationErrors = validationResult(req).array();
  if (validationErrors && validationErrors.length > 0) throw validationErrors;

  await Coupon.apply(user, req, req.params.code);
}
