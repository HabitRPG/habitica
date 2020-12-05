import stripeModule from 'stripe';

import common from '../../../../../../website/common';
import * as subscriptions from '../../../../../../website/server/libs/payments/stripe/subscriptions';
import * as oneTimePayments from '../../../../../../website/server/libs/payments/stripe/oneTimePayments';
import {
  createCheckoutSession,
  createEditCardCheckoutSession,
} from '../../../../../../website/server/libs/payments/stripe/checkout';
import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import payments from '../../../../../../website/server/libs/payments/payments';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

const { i18n } = common;

describe('Stripe - Checkout', () => {
  const stripe = stripeModule('test', {
    apiVersion: '2020-08-27',
  });

  describe('createCheckoutSession', () => {
    let user;

    beforeEach(() => {
      user = new User();
    });

    it.only('gems', async () => {
      sandbox.stub(oneTimePayments, 'getOneTimePaymentInfo').returns({
        amount: 999,
        gemsBlock: common.content.gems['21gems'],
      }, stripe);
      await createCheckoutSession({ user });
      expect(oneTimePayments.getOneTimePaymentInfo).to.be.calledOnce;
    });
    it('gems gift');
    it('subscription gift');
    it('subscription');
    it('throws if group does not exists');
    it('group plan');
  });
  describe('createEditCardCheckoutSession', () => {
    it('throws if customer does not exists');
    it('throws if subscription does not exists');
    it('change card for user subscription');
    it('throws if group does not exists');
    it('throws if user is not allowed to change group plan');
    it('change card for group plans - leader');
    it('change card for group plans - plan owner');
  });
});
