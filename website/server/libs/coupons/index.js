import { model as Coupon } from '../../models/coupon';

export async function enterCode (req, res, user) { // eslint-disable-line import/prefer-default-export, max-len
  req.checkParams('code', res.t('couponCodeRequired')).notEmpty();

  const validationErrors = req.validationErrors();
  if (validationErrors) throw validationErrors;

  await Coupon.apply(user, req, req.params.code);
}
