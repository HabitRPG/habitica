// This file is used for creating paypal billing plans. PayPal doesn't have a web interface for setting up recurring
// payment plan definitions, instead you have to create it via their REST SDK and keep it updated the same way. So this
// file will be used once for initing your billing plan (then you get the resultant plan.id to store in config.json),
// and once for any time you need to edit the plan thereafter

var path = require('path');
var nconf = require('nconf');
nconf.argv().env().file('user', path.join(path.resolve(__dirname, '../../../config.json')));
var paypal = require('paypal-rest-sdk');
var OP = "list"; // list create update remove

paypal.configure({
  'mode': nconf.get("PAYPAL:mode"), //sandbox or live
  'client_id': nconf.get("PAYPAL:client_id"),
  'client_secret': nconf.get("PAYPAL:client_secret")
});

var billingPlanTitle ="HabitRPG subscription ($5 month-to-month)";
// https://developer.paypal.com/docs/api/#billing-plans-and-agreements
var billingPlanAttributes = {
  "name": billingPlanTitle,
  "description": billingPlanTitle,
  "type": "INFINITE",
  "merchant_preferences": {
    "auto_bill_amount": "yes",
    "cancel_url": nconf.get("BASE_URL"),
    "return_url": nconf.get('BASE_URL') + '/paypal/subscribe/success'
  },
  "payment_definitions": [{
    "name": billingPlanTitle,
    "type": "REGULAR",
    "frequency_interval": "1",
    "frequency": "MONTH",
    "cycles": "0",
    "amount": {
      "currency": "USD",
      "value": "5"
    }
  }]
};

switch(OP) {
  case "list":
    paypal.billingPlan.list({status: 'ACTIVE'}, function(err, plans){
      console.log({err:err, plans:plans});
    });
    break;
  case "update":
    break;
  case "create":
    paypal.billingPlan.create(billingPlanAttributes, function(err,plan){
      if (plan.state == "ACTIVE")
        return console.log({err:err, plan:plan});
      var billingPlanUpdateAttributes = [{
        "op": "replace",
        "path": "/",
        "value": {
          "state": "ACTIVE"
        }
      }];
      // Activate the plan by changing status to Active
      paypal.billingPlan.update(plan.id, billingPlanUpdateAttributes, function(err, response){
        console.log({err:err, response:response});
      });
    });
  case "remove":
    break;
}