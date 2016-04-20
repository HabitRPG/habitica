// This file is used for creating paypal billing plans. PayPal doesn't have a web interface for setting up recurring
// payment plan definitions, instead you have to create it via their REST SDK and keep it updated the same way. So this
// file will be used once for initing your billing plan (then you get the resultant plan.id to store in config.json),
// and once for any time you need to edit the plan thereafter
import path from 'path';
import nconf from 'nconf';
import _ from 'lodash';
import paypal from 'paypal-rest-sdk';
import shared from '../../../../../common';

let blocks = shared.content.subscriptionBlocks;
const BILLING_PLAN_TITLE = 'Habitica Subscription';
const LIVE = nconf.get('PAYPAL:mode') === 'live';
const OP = 'create'; // list create update remove

nconf.argv().env().file('user', path.join(path.resolve(__dirname, '../../../config.json')));

/* eslint-disable camelcase */
paypal.configure({
  mode: nconf.get('PAYPAL:mode'), // sandbox or live
  client_id: nconf.get('PAYPAL:client_id'),
  client_secret: nconf.get('PAYPAL:client_secret'),
});

// https://developer.paypal.com/docs/api/#billing-plans-and-agreements
let billingPlanAttributes = {
  name: BILLING_PLAN_TITLE,
  description: BILLING_PLAN_TITLE,
  type: 'INFINITE',
  merchant_preferences: {
    auto_bill_amount: 'yes',
    cancel_url: LIVE ? 'https://habitica.com' : 'http://localhost:3000',
    return_url: LIVE ? 'https://habitica.com/paypal/subscribe/success' : 'http://localhost:3000/paypal/subscribe/success',
  },
  payment_definitions: [{
    type: 'REGULAR',
    frequency: 'MONTH',
    cycles: '0',
  }],
};
_.each(blocks, function defineBlock (block) {
  block.definition = _.cloneDeep(billingPlanAttributes);
  _.merge(block.definition.payment_definitions[0], {
    name: `${BILLING_PLAN_TITLE} (\$${block.price} every ${block.months} months, recurring)`,
    frequency_interval: `${block.months}`,
    amount: {
      currency: 'USD',
      value: `${block.price}`,
    },
  });
});

let update = {
  op: 'replace',
  path: '/merchant_preferences',
  value: {
    cancel_url: 'https://habitica.com',
  },
};

switch (OP) {
  case 'list':
    paypal.billingPlan.list({status: 'ACTIVE'}, function listPlans () {
      // TODO Was a console.log statement. Need proper response output
    });
    break;
  case 'get':
    paypal.billingPlan.get(nconf.get('PAYPAL:billing_plans:12'), function getPlan () {
      // TODO Was a console.log statement. Need proper response output
    });
    break;
  case 'update':
    paypal.billingPlan.update(nconf.get('PAYPAL:billing_plans:12'), update, function updatePlan () {
      // TODO Was a console.log statement. Need proper response output
    });
    break;
  case 'create':
    paypal.billingPlan.create(blocks.google_6mo.definition, function createPlan (err, plan) {
      if (err) return; // TODO Was a console.log statement. Need proper response output
      if (plan.state === 'ACTIVE')
        return; // TODO Was a console.log statement. Need proper response output
      let billingPlanUpdateAttributes = [{
        op: 'replace',
        path: '/',
        value: {
          state: 'ACTIVE',
        },
      }];
      // Activate the plan by changing status to Active
      paypal.billingPlan.update(plan.id, billingPlanUpdateAttributes, function activatePlan () {
        // TODO Was a console.log statement. Need proper response output
      });
    });
    break;
  case 'remove': break;
}
/* eslint-enable camelcase */
