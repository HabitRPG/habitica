import { model as Coupon } from '../../models/coupon';

export async function enterCode (req, res, user) {
  req.checkParams('code', res.t('couponCodeRequired')).notEmpty();

  let validationErrors = req.validationErrors();
  if (validationErrors) throw validationErrors;

  await Coupon.apply(user, req, req.params.code);
}