import moment from 'moment';
import calculateSubscriptionTerminationDate from '../../../../../../website/server/libs/payments/calculateSubscriptionTerminationDate';
import api from '../../../../../../website/server/libs/payments/payments';

const groupPlanId = api.constants.GROUP_PLAN_CUSTOMER_ID;

describe('stripe - #calculateSubscriptionTerminationDate', () => {
  let plan;
  let nextBill;

  beforeEach(() => {
    plan = {
      customerId: 'customer-id',
      extraMonths: 0,
    };
    nextBill = moment();
  });

  it('should extend date to the exact amount of days left before the next bill will occur', () => {
    nextBill = moment()
      .add(5, 'days');
    const expectedTerminationDate = moment()
      .add(5, 'days');

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('if nextBill is null, add 30 days to termination date', () => {
    nextBill = null;
    const expectedTerminationDate = moment()
      .add(30, 'days');
    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);

    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('if nextBill is null and it\'s a group plan, add 2 days instead of 30', () => {
    nextBill = null;
    plan.customerId = api.constants.GROUP_PLAN_CUSTOMER_ID;
    const expectedTerminationDate = moment()
      .add(2, 'days');

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('should add 30.5 days for each extraMonth', () => {
    plan.extraMonths = 4;
    const expectedTerminationDate = moment()
      .add(30.5 * 4, 'days');

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('should round up if total days gained by extraMonth is a decimal number', () => {
    plan.extraMonths = 5;
    const expectedTerminationDate = moment()
      .add(Math.ceil(30.5 * 5), 'days');

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('behaves like extraMonths is 0 if it\'s set to a negative number', () => {
    plan.extraMonths = -5;
    const expectedTerminationDate = moment();
    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });

  it('returns current terminated date if it exists and is later than newly calculated date', () => {
    const expectedTerminationDate = moment().add({ months: 5 }).toDate();
    plan.dateTerminated = expectedTerminationDate;

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);

    expect(terminationDate).to.equal(expectedTerminationDate);
  });

  it('returns the calculated termination date if the plan does not have one', () => {
    nextBill = moment().add(5, 'days');
    const expectedTerminationDate = moment().add(5, 'days');

    const terminationDate = calculateSubscriptionTerminationDate(nextBill, plan, groupPlanId);
    expect(expectedTerminationDate.diff(terminationDate, 'days')).to.eql(0);
  });
});
