/* eslint-disable camelcase */

import mongoose from 'mongoose';
import _ from 'lodash';
import shared from '../../common';
import couponCode from 'coupon-code';
import baseModel from '../libs/baseModel';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';

export let schema = new mongoose.Schema({
  _id: {type: String, default: couponCode.generate},
  event: {type: String, enum: ['wondercon', 'google_6mo']},
  user: {type: String, ref: 'User'},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  timestamps: true,
  _id: false,
});

schema.statics.generate = async function generateCoupons (event, count = 1) {
  let coupons = _.times(count, () => {
    return {event};
  });

  return await this.create(coupons);
};

schema.statics.apply = async function applyCoupon (user, req, code) {
  let coupon = await this.findById(couponCode.validate(code)).exec();
  if (!coupon) throw new BadRequest(shared.i18n.t('invalidCoupon', req.language));
  if (coupon.user) throw new NotAuthorized(shared.i18n.t('couponUsed', req.language));

  if (coupon.event === 'wondercon') {
    user.items.gear.owned.eyewear_special_wondercon_red = true;
    user.items.gear.owned.eyewear_special_wondercon_black = true;
    user.items.gear.owned.back_special_wondercon_black = true;
    user.items.gear.owned.back_special_wondercon_red = true;
    user.items.gear.owned.body_special_wondercon_red = true;
    user.items.gear.owned.body_special_wondercon_black = true;
    user.items.gear.owned.body_special_wondercon_gold = true;
    user.extra = {signupEvent: 'wondercon'};
  }

  await user.save();
  coupon.user = user._id;
  await coupon.save();
};

module.exports.schema = schema;
export let model = mongoose.model('Coupon', schema);
