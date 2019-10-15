/* eslint-disable import/no-commonjs */
require('@babel/register'); // eslint-disable-line import/no-extraneous-dependencies

// This file is used for creating paypal billing plans.
// PayPal doesn't have a web interface for setting up recurring
// payment plan definitions, instead you have to create it
// via their REST SDK and keep it updated the same way. So this
// file will be used once for initing your billing plan
// (then you get the resultant plan.id to store in config.json),
// and once for any time you need to edit the plan thereafter

/* eslint-disable no-console, camelcase, no-case-declarations */

const path = require('path');
const nconf = require('nconf');
const _ = require('lodash');
const paypal = require('paypal-rest-sdk');
const blocks = require('../website/common').content.subscriptionBlocks;

const live = nconf.get('PAYPAL_MODE') === 'live';

nconf.argv().env().file('user', path.join(path.resolve(__dirname, '../config.json')));

const OP = 'create'; // list get update create create-webprofile

paypal.configure({
  mode: nconf.get('PAYPAL_MODE'), // sandbox or live
  client_id: nconf.get('PAYPAL_CLIENT_ID'),
  client_secret: nconf.get('PAYPAL_CLIENT_SECRET'),
});

// https://developer.paypal.com/docs/api/#billing-plans-and-agreements
const billingPlanTitle = 'Habitica Subscription';
const billingPlanAttributes = {
  description: billingPlanTitle,
  type: 'INFINITE',
  merchant_preferences: {
    auto_bill_amount: 'yes',
    cancel_url: live ? 'https://habitica.com' : 'http://localhost:3000',
    return_url: `${live ? 'https://habitica.com' : 'http://localhost:3000'}/paypal/subscribe/success`,
  },
  payment_definitions: [{
    type: 'REGULAR',
    frequency: 'MONTH',
    cycles: '0',
  }],
};

_.each(blocks, block => {
  block.definition = _.cloneDeep(billingPlanAttributes);
  _.merge(block.definition.payment_definitions[0], {
    name: `${billingPlanTitle} ($${block.price} every ${block.months} months, recurring)`,
    frequency_interval: `${block.months}`,
    amount: {
      currency: 'USD',
      value: `${block.price}`,
    },
  });
});

// @TODO: Add cli library for this

switch (OP) {
  case 'list':
    paypal.billingPlan.list({ status: 'ACTIVE' }, (err, plans) => {
      console.log({ err, plans });
    });
    break;
  case 'get':
    paypal.billingPlan.get(nconf.get('PAYPAL_BILLING_PLANS_basic_12mo'), (err, plan) => {
      console.log({ err, plan });
    });
    break;
  case 'update':
    const updatePayload = {
      op: 'replace',
      path: '/merchant_preferences',
      value: {
        cancel_url: 'https://habitica.com',
      },
    };
    paypal.billingPlan.update(nconf.get('PAYPAL_BILLING_PLANS_basic_12mo'), updatePayload, (err, res) => {
      console.log({ err, plan: res });
    });
    break;
  case 'create':
    paypal.billingPlan.create(blocks.google_6mo.definition, (err, plan) => {
      if (err) return console.log(err);

      if (plan.state === 'ACTIVE') {
        return console.log({ err, plan });
      }

      const billingPlanUpdateAttributes = [{
        op: 'replace',
        path: '/',
        value: {
          state: 'ACTIVE',
        },
      }];

      // Activate the plan by changing status to Active
      paypal.billingPlan.update(plan.id, billingPlanUpdateAttributes, (err2, response) => {
        console.log({ err: err2, response, id: plan.id });
      });

      return null;
    });
    break;
  case 'create-webprofile':
    const webexpinfo = {
      name: 'HabiticaProfile',
      input_fields: {
        no_shipping: 1,
      },
    };

    paypal.webProfile.create(webexpinfo, (error, result) => {
      console.log(error, result);
    });
    break;
  default:
    throw new Error('Invalid op');
}
