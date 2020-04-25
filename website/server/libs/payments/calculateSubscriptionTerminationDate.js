import moment from 'moment';

const DEFAULT_REMAINING_DAYS = 30;
const DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN = 2;

/**
 * paymentsApiConstants is provided as parameter because of a dependency cycle
 * with subscriptions api which will occur if api.constants would be used directly
 */
export default function calculateSubscriptionTerminationDate (
  nextBill, purchasedPlan, paymentsApiConstants,
) {
  const defaultRemainingDays = (
    purchasedPlan.customerId === paymentsApiConstants.GROUP_PLAN_CUSTOMER_ID
  ) ? DEFAULT_REMAINING_DAYS_FOR_GROUP_PLAN
    : DEFAULT_REMAINING_DAYS;

  const remaining = nextBill
    ? moment(nextBill).diff(new Date(), 'days', true)
    : defaultRemainingDays;

  const extraMonths = Math.max(purchasedPlan.extraMonths, 0);
  const extraDays = Math.ceil(30.5 * extraMonths);

  return moment().startOf('day')
    .add({ days: remaining })
    .add({ days: extraDays })
    .toDate();
}
